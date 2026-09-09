import { getCloudflareContext } from "@opennextjs/cloudflare";

import { normalizeEmail } from "@/lib/auth";

type VerifyBody = {
  email?: unknown;
  code?: unknown;
};

type LoginCodeRow = {
  id: string;
  code_hash: string;
  attempts: number;
};

const SUPERADMIN_EMAIL = "saeid.bararjanian@gmail.com";
const MAX_ATTEMPTS = 5;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

async function hashValue(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateSessionToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;

    if (
      typeof body.email !== "string" ||
      typeof body.code !== "string"
    ) {
      return Response.json(
        {
          success: false,
          message: "ایمیل و کد ورود الزامی هستند.",
        },
        { status: 400 },
      );
    }

    const email = normalizeEmail(body.email);
    const code = body.code.trim();

    if (email !== SUPERADMIN_EMAIL) {
      return Response.json(
        {
          success: false,
          message: "کد ورود نامعتبر یا منقضی شده است.",
        },
        { status: 401 },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return Response.json(
        {
          success: false,
          message: "کد ورود باید ۶ رقم باشد.",
        },
        { status: 400 },
      );
    }

    const { env } = getCloudflareContext();

    const loginCode = await env.appkhor_db
      .prepare(
        `SELECT
          id,
          code_hash,
          attempts
        FROM superadmin_login_codes
        WHERE email = ?
          AND used_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1`,
      )
      .bind(email)
      .first<LoginCodeRow>();

    if (!loginCode || loginCode.attempts >= MAX_ATTEMPTS) {
      return Response.json(
        {
          success: false,
          message: "کد ورود نامعتبر یا منقضی شده است.",
        },
        { status: 401 },
      );
    }

    const submittedHash = await hashValue(code);

    if (submittedHash !== loginCode.code_hash) {
      await env.appkhor_db
        .prepare(
          `UPDATE superadmin_login_codes
          SET attempts = attempts + 1
          WHERE id = ?`,
        )
        .bind(loginCode.id)
        .run();

      return Response.json(
        {
          success: false,
          message: "کد ورود نامعتبر یا منقضی شده است.",
        },
        { status: 401 },
      );
    }

    const sessionToken = generateSessionToken();
    const sessionTokenHash = await hashValue(sessionToken);
    const sessionId = crypto.randomUUID();

    await env.appkhor_db.batch([
      env.appkhor_db
        .prepare(
          `UPDATE superadmin_login_codes
          SET used_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(loginCode.id),

      env.appkhor_db
        .prepare(
          `DELETE FROM superadmin_sessions
          WHERE email = ?
             OR expires_at <= CURRENT_TIMESTAMP`,
        )
        .bind(email),

      env.appkhor_db
        .prepare(
          `INSERT INTO superadmin_sessions (
            id,
            email,
            token_hash,
            expires_at,
            last_used_at
          )
          VALUES (
            ?,
            ?,
            ?,
            datetime('now', '+12 hours'),
            CURRENT_TIMESTAMP
          )`,
        )
        .bind(
          sessionId,
          email,
          sessionTokenHash,
        ),
    ]);

    const secure =
      new URL(request.url).protocol === "https:";

    const cookieParts = [
      `appkhor_superadmin_session=${sessionToken}`,
      "Path=/",
      `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
      "HttpOnly",
      "SameSite=Strict",
    ];

    if (secure) {
      cookieParts.push("Secure");
    }

    return Response.json(
      {
        success: true,
        message: "ورود با موفقیت انجام شد.",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookieParts.join("; "),
        },
      },
    );
  } catch (error) {
    console.error("Superadmin verify code error:", error);

    return Response.json(
      {
        success: false,
        message: "در ورود به پنل مدیریت مشکلی پیش آمد.",
      },
      { status: 500 },
    );
  }
}
