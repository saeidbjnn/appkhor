import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

type ForgotPasswordBody = {
  email?: unknown;
};

type UserRow = {
  id: string;
  account_status: string;
  has_password: number;
};

type RecentResetRow = {
  id: string;
};

function generateResetToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashResetToken(token: string): Promise<string> {
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
    const body = (await request.json()) as ForgotPasswordBody;

    if (typeof body.email !== "string") {
      return Response.json(
        {
          success: false,
          message: "ایمیل الزامی است.",
        },
        { status: 400 },
      );
    }

    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      return Response.json(
        {
          success: false,
          message: "ایمیل واردشده معتبر نیست.",
        },
        { status: 400 },
      );
    }

    const genericResponse = {
      success: true,
      message:
        "اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی رمز ارسال می‌شود.",
    };

    const { env } = getCloudflareContext();

    const user = await env.appkhor_db
      .prepare(
        `SELECT
          users.id,
          users.account_status,
          CASE
            WHEN password_credentials.user_id IS NOT NULL THEN 1
            ELSE 0
          END AS has_password
        FROM users
        LEFT JOIN password_credentials
          ON password_credentials.user_id = users.id
        WHERE users.primary_email = ?
          OR users.email = ?
        LIMIT 1`,
      )
      .bind(email, email)
      .first<UserRow>();

    if (
      !user ||
      user.account_status !== "ACTIVE" ||
      user.has_password !== 1
    ) {
      return Response.json(genericResponse);
    }

    const recentReset = await env.appkhor_db
      .prepare(
        `SELECT id
        FROM password_reset_tokens
        WHERE user_id = ?
          AND created_at > datetime('now', '-60 seconds')
        ORDER BY created_at DESC
        LIMIT 1`,
      )
      .bind(user.id)
      .first<RecentResetRow>();

    if (recentReset) {
      return Response.json(genericResponse);
    }

    const emailEnv = env as typeof env & {
      RESEND_API_KEY?: string;
      EMAIL_FROM?: string;
      APP_URL?: string;
    };

    if (
      !emailEnv.RESEND_API_KEY ||
      !emailEnv.EMAIL_FROM ||
      !emailEnv.APP_URL
    ) {
      console.error(
        "Password reset email configuration is missing.",
      );

      return Response.json(
        {
          success: false,
          message:
            "بازیابی رمز عبور در حال حاضر در دسترس نیست.",
        },
        { status: 500 },
      );
    }

    const resetId = crypto.randomUUID();
    const resetToken = generateResetToken();
    const tokenHash = await hashResetToken(resetToken);

    await env.appkhor_db
      .prepare(
        `INSERT INTO password_reset_tokens (
          id,
          user_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?, datetime('now', '+30 minutes'))`,
      )
      .bind(
        resetId,
        user.id,
        tokenHash,
      )
      .run();

    try {
      await sendPasswordResetEmail({
        apiKey: emailEnv.RESEND_API_KEY,
        from: emailEnv.EMAIL_FROM,
        to: email,
        token: resetToken,
        appUrl: emailEnv.APP_URL,
      });
    } catch (error) {
      console.error("Password reset email send failed:", error);

      await env.appkhor_db
        .prepare(
          `DELETE FROM password_reset_tokens
          WHERE id = ?`,
        )
        .bind(resetId)
        .run();

      return Response.json(
        {
          success: false,
          message:
            "ارسال ایمیل بازیابی انجام نشد. دوباره تلاش کنید.",
        },
        { status: 500 },
      );
    }

    await env.appkhor_db
      .prepare(
        `UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
          AND id <> ?
          AND used_at IS NULL`,
      )
      .bind(user.id, resetId)
      .run();

    return Response.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);

    return Response.json(
      {
        success: false,
        message:
          "در بازیابی رمز عبور مشکلی پیش آمد. دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  }
}