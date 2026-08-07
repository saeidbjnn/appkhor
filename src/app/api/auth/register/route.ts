import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  hashPassword,
  isValidEmail,
  normalizeEmail,
  validatePassword,
} from "@/lib/auth";

export const runtime = "nodejs";

type RegisterBody = {
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;

    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      typeof body.confirmPassword !== "string"
    ) {
      return Response.json(
        {
          success: false,
          message: "اطلاعات ثبت‌نام کامل نیست.",
        },
        { status: 400 },
      );
    }

    const email = normalizeEmail(body.email);
    const password = body.password;
    const confirmPassword = body.confirmPassword;

    if (!isValidEmail(email)) {
      return Response.json(
        {
          success: false,
          message: "ایمیل واردشده معتبر نیست.",
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

    if (password !== confirmPassword) {
      return Response.json(
        {
          success: false,
          message: "رمز عبور و تکرار آن یکسان نیستند.",
        },
        { status: 400 },
      );
    }

    const { env } = getCloudflareContext();

    const existingUser = await env.appkhor_db
      .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
      .bind(email)
      .first<{ id: string }>();

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "این ایمیل قبلاً ثبت شده است. وارد حساب خود شوید.",
        },
        { status: 409 },
      );
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await env.appkhor_db
      .prepare(
        `INSERT INTO users (
          id,
          email,
          password_hash,
          role,
          is_active
        ) VALUES (?, ?, ?, 'user', 1)`,
      )
      .bind(userId, email, passwordHash)
      .run();

    return Response.json(
      {
        success: true,
        message: "ثبت‌نام با موفقیت انجام شد.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);

    return Response.json(
      {
        success: false,
        message: "در ثبت‌نام مشکلی پیش آمد. دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  }
}