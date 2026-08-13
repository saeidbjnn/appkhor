import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  normalizeEmail,
  verifyVerificationCode,
} from "@/lib/auth";

export const runtime = "nodejs";

type VerifyEmailBody = {
  email?: unknown;
  code?: unknown;
};

type UserRow = {
  id: string;
  email_verified_at: string | null;
  account_status: string;
};

type VerificationCodeRow = {
  id: string;
  code_hash: string;
  attempts: number;
};

const MAX_ATTEMPTS = 5;
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 30;

function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyEmailBody;

    if (
      typeof body.email !== "string" ||
      typeof body.code !== "string"
    ) {
      return Response.json(
        {
          success: false,
          message: "ایمیل و کد تأیید الزامی هستند.",
        },
        { status: 400 },
      );
    }

    const email = normalizeEmail(body.email);
    const code = body.code.trim();

    if (!/^\d{6}$/.test(code)) {
      return Response.json(
        {
          success: false,
          message: "کد تأیید باید ۶ رقم باشد.",
        },
        { status: 400 },
      );
    }

    const { env } = getCloudflareContext();

    const user = await env.appkhor_db
      .prepare(
        `SELECT
          id,
          email_verified_at,
          account_status
        FROM users
        WHERE primary_email = ?
          OR email = ?
        LIMIT 1`,
      )
      .bind(email, email)
      .first<UserRow>();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "کد تأیید معتبر نیست یا منقضی شده است.",
        },
        { status: 400 },
      );
    }

    if (user.account_status !== "ACTIVE") {
      return Response.json(
        {
          success: false,
          message: "این حساب در حال حاضر فعال نیست.",
        },
        { status: 403 },
      );
    }

    /*
     * مهم:
     * اگر ایمیل قبلاً تأیید شده باشد، اینجا Session نمی‌سازیم.
     * چون صرف دانستن ایمیل نباید باعث ورود به حساب شود.
     */
    if (user.email_verified_at) {
      return Response.json({
        success: true,
        verified: true,
        authenticated: false,
        message: "ایمیل شما قبلاً تأیید شده است.",
      });
    }

    const verification = await env.appkhor_db
      .prepare(
        `SELECT
          id,
          code_hash,
          attempts
        FROM email_verification_codes
        WHERE user_id = ?
          AND used_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1`,
      )
      .bind(user.id)
      .first<VerificationCodeRow>();

    if (!verification) {
      return Response.json(
        {
          success: false,
          message: "کد تأیید معتبر نیست یا منقضی شده است.",
        },
        { status: 400 },
      );
    }

    if (verification.attempts >= MAX_ATTEMPTS) {
      return Response.json(
        {
          success: false,
          message:
            "تعداد تلاش‌های مجاز تمام شده است. کد جدید درخواست کنید.",
        },
        { status: 429 },
      );
    }

    const codeMatches = await verifyVerificationCode(
      code,
      verification.code_hash,
    );

    if (!codeMatches) {
      await env.appkhor_db
        .prepare(
          `UPDATE email_verification_codes
          SET attempts = attempts + 1
          WHERE id = ?`,
        )
        .bind(verification.id)
        .run();

      return Response.json(
        {
          success: false,
          message: "کد تأیید صحیح نیست.",
        },
        { status: 400 },
      );
    }

    /*
     * کد صحیح است:
     * 1. ایمیل را تأیید می‌کنیم.
     * 2. کدهای تأیید باز را مصرف‌شده می‌کنیم.
     * 3. Session می‌سازیم.
     * 4. زمان آخرین ورود را ثبت می‌کنیم.
     * 5. Identity ایمیل/رمز را به‌روز می‌کنیم.
     */

    const sessionId = crypto.randomUUID();
    const sessionToken = randomToken();
    const tokenHash = await hashToken(sessionToken);

    const expiresAt = new Date(
      Date.now() + SESSION_LIFETIME_SECONDS * 1000,
    )
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");

    const userAgent = request.headers.get("user-agent");

    await env.appkhor_db.batch([
      env.appkhor_db
        .prepare(
          `UPDATE users
          SET
            email_verified_at = CURRENT_TIMESTAMP,
            last_login_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(user.id),

      env.appkhor_db
        .prepare(
          `UPDATE email_verification_codes
          SET used_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
            AND used_at IS NULL`,
        )
        .bind(user.id),

      env.appkhor_db
        .prepare(
          `INSERT INTO sessions (
            id,
            user_id,
            token_hash,
            expires_at,
            user_agent,
            last_used_at
          )
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        )
        .bind(
          sessionId,
          user.id,
          tokenHash,
          expiresAt,
          userAgent,
        ),

      env.appkhor_db
        .prepare(
          `UPDATE auth_identities
          SET
            last_used_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
            AND provider = 'EMAIL_PASSWORD'`,
        )
        .bind(user.id),
    ]);

    const isHttps = new URL(request.url).protocol === "https:";

    const cookie = [
      `appkhor_session=${sessionToken}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${SESSION_LIFETIME_SECONDS}`,
      isHttps ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    return Response.json(
      {
        success: true,
        verified: true,
        authenticated: true,
        message: "ایمیل شما تأیید شد و وارد حساب شدید.",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      },
    );
  } catch (error) {
    console.error("Verify email error:", error);

    return Response.json(
      {
        success: false,
        message:
          "در تأیید ایمیل مشکلی پیش آمد. دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  }
}