import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

type UserRow = {
  id: string;
  email_verified_at: string | null;
  account_status: string;
  password_hash: string | null;
};

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
    const body = (await request.json()) as LoginBody;

    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return Response.json(
        {
          success: false,
          message: "ایمیل و رمز عبور الزامی هستند.",
        },
        { status: 400 },
      );
    }

    const email = normalizeEmail(body.email);
    const password = body.password;

    const { env } = getCloudflareContext();

    const user = await env.appkhor_db
      .prepare(
        `SELECT
          users.id,
          users.email_verified_at,
          users.account_status,
          password_credentials.password_hash
        FROM users
        LEFT JOIN password_credentials
          ON password_credentials.user_id = users.id
        WHERE users.primary_email = ?
          OR users.email = ?
        LIMIT 1`,
      )
      .bind(email, email)
      .first<UserRow>();

    if (!user || !user.password_hash) {
      return Response.json(
        {
          success: false,
          message: "ایمیل یا رمز عبور صحیح نیست.",
        },
        { status: 401 },
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

    const passwordMatches = await verifyPassword(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      return Response.json(
        {
          success: false,
          message: "ایمیل یا رمز عبور صحیح نیست.",
        },
        { status: 401 },
      );
    }

    if (!user.email_verified_at) {
      return Response.json(
        {
          success: false,
          emailVerificationRequired: true,
          message: "ابتدا ایمیل خود را تأیید کنید.",
        },
        { status: 403 },
      );
    }

    const sessionId = crypto.randomUUID();
    const sessionToken = randomToken();
    const tokenHash = await hashToken(sessionToken);

    const sessionLifetimeSeconds = 60 * 60 * 24 * 30;

    const expiresAt = new Date(
      Date.now() + sessionLifetimeSeconds * 1000,
    )
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");

    const userAgent = request.headers.get("user-agent");

    await env.appkhor_db.batch([
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
          `UPDATE users
          SET
            last_login_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(user.id),

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
      `Max-Age=${sessionLifetimeSeconds}`,
      isHttps ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    return Response.json(
      {
        success: true,
        message: "با موفقیت وارد حساب شدید.",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      },
    );
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      {
        success: false,
        message: "در ورود به حساب مشکلی پیش آمد. دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  }
}