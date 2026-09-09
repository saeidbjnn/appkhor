import { getCloudflareContext } from "@opennextjs/cloudflare";

import { normalizeEmail } from "@/lib/auth";
import { sendSuperadminLoginCodeEmail } from "@/lib/email";

type RequestBody = {
  email?: unknown;
};

type RecentCodeRow = {
  id: string;
};

const SUPERADMIN_EMAIL = "saeid.bararjanian@gmail.com";

function generateCode(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);

  return String(values[0] % 1_000_000).padStart(6, "0");
}

async function hashValue(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

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

    const genericResponse = {
      success: true,
      message:
        "اگر این ایمیل اجازه ورود داشته باشد، کد ورود برای آن ارسال می‌شود.",
    };

    if (email !== SUPERADMIN_EMAIL) {
      return Response.json(genericResponse);
    }

    const { env } = getCloudflareContext();

    const emailEnv = env as typeof env & {
      RESEND_API_KEY?: string;
      EMAIL_FROM?: string;
    };

    if (!emailEnv.RESEND_API_KEY || !emailEnv.EMAIL_FROM) {
      console.error("Superadmin email configuration is missing.");

      return Response.json(
        {
          success: false,
          message: "ارسال کد ورود در حال حاضر در دسترس نیست.",
        },
        { status: 500 },
      );
    }

    const recentCode = await env.appkhor_db
      .prepare(
        `SELECT id
        FROM superadmin_login_codes
        WHERE email = ?
          AND created_at > datetime('now', '-60 seconds')
        ORDER BY created_at DESC
        LIMIT 1`,
      )
      .bind(email)
      .first<RecentCodeRow>();

    if (recentCode) {
      return Response.json(genericResponse);
    }

    const code = generateCode();
    const codeHash = await hashValue(code);
    const codeId = crypto.randomUUID();

    await env.appkhor_db
      .prepare(
        `INSERT INTO superadmin_login_codes (
          id,
          email,
          code_hash,
          expires_at
        )
        VALUES (?, ?, ?, datetime('now', '+10 minutes'))`,
      )
      .bind(codeId, email, codeHash)
      .run();

    try {
      await sendSuperadminLoginCodeEmail({
        apiKey: emailEnv.RESEND_API_KEY,
        from: emailEnv.EMAIL_FROM,
        to: email,
        code,
      });
    } catch (error) {
      console.error("Superadmin login email send failed:", error);

      await env.appkhor_db
        .prepare(
          `DELETE FROM superadmin_login_codes
          WHERE id = ?`,
        )
        .bind(codeId)
        .run();

      return Response.json(
        {
          success: false,
          message: "ارسال کد ورود انجام نشد. دوباره تلاش کنید.",
        },
        { status: 500 },
      );
    }

    await env.appkhor_db
      .prepare(
        `UPDATE superadmin_login_codes
        SET used_at = CURRENT_TIMESTAMP
        WHERE email = ?
          AND id <> ?
          AND used_at IS NULL`,
      )
      .bind(email, codeId)
      .run();

    return Response.json(genericResponse);
  } catch (error) {
    console.error("Superadmin request code error:", error);

    return Response.json(
      {
        success: false,
        message: "در ارسال کد ورود مشکلی پیش آمد.",
      },
      { status: 500 },
    );
  }
}
