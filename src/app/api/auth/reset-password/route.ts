import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  hashPassword,
  validatePassword,
} from "@/lib/auth";

type ResetPasswordBody = {
  token?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

type ResetTokenRow = {
  id: string;
  user_id: string;
};

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
    const body = (await request.json()) as ResetPasswordBody;

    if (
      typeof body.token !== "string" ||
      typeof body.password !== "string" ||
      typeof body.confirmPassword !== "string"
    ) {
      return Response.json(
        {
          success: false,
          message: "اطلاعات واردشده کامل نیست.",
        },
        { status: 400 },
      );
    }

    const token = body.token.trim();
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "لینک بازیابی معتبر نیست.",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        {
          success: false,
          message: "رمز عبور و تکرار آن یکسان نیستند.",
        },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return Response.json(
        {
          success: false,
          message: passwordError,
        },
        { status: 400 },
      );
    }

    const tokenHash = await hashResetToken(token);

    const { env } = getCloudflareContext();

    const resetToken = await env.appkhor_db
      .prepare(
        `SELECT
          id,
          user_id
        FROM password_reset_tokens
        WHERE token_hash = ?
          AND used_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1`,
      )
      .bind(tokenHash)
      .first<ResetTokenRow>();

    if (!resetToken) {
      return Response.json(
        {
          success: false,
          message:
            "لینک بازیابی نامعتبر یا منقضی شده است.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await env.appkhor_db.batch([
      env.appkhor_db
        .prepare(
          `UPDATE password_credentials
          SET
            password_hash = ?,
            updated_at = CURRENT_TIMESTAMP,
            password_changed_at = CURRENT_TIMESTAMP
          WHERE user_id = ?`,
        )
        .bind(
          passwordHash,
          resetToken.user_id,
        ),

      env.appkhor_db
        .prepare(
          `UPDATE users
          SET
            password_hash = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          passwordHash,
          resetToken.user_id,
        ),

      env.appkhor_db
        .prepare(
          `UPDATE password_reset_tokens
          SET used_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
            AND used_at IS NULL`,
        )
        .bind(resetToken.user_id),

      env.appkhor_db
        .prepare(
          `DELETE FROM sessions
          WHERE user_id = ?`,
        )
        .bind(resetToken.user_id),
    ]);

    return Response.json({
      success: true,
      message:
        "رمز عبور با موفقیت تغییر کرد. حالا می‌توانید وارد حساب شوید.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return Response.json(
      {
        success: false,
        message:
          "در تغییر رمز عبور مشکلی پیش آمد. دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  }
}