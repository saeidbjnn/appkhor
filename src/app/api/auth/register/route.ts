import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  generateVerificationCode,
  hashPassword,
  hashVerificationCode,
  isValidEmail,
  normalizeEmail,
  validatePassword,
} from "@/lib/auth";

import { sendVerificationEmail } from "@/lib/email";

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
    const identityId = crypto.randomUUID();
    const credentialId = crypto.randomUUID();
    const verificationId = crypto.randomUUID();

    const passwordHash = await hashPassword(password);

    const verificationCode = generateVerificationCode();
    const verificationCodeHash =
      await hashVerificationCode(verificationCode);

    await env.appkhor_db.batch([
      env.appkhor_db
        .prepare(
          `INSERT INTO users (
            id,
            email,
            password_hash,
            role,
            is_active,
            primary_email,
            account_role,
            account_status
          ) VALUES (?, ?, ?, 'user', 1, ?, 'USER', 'ACTIVE')`,
        )
        .bind(userId, email, passwordHash, email),

      env.appkhor_db
        .prepare(
          `INSERT INTO auth_identities (
            id,
            user_id,
            provider,
            provider_user_id,
            provider_email
          ) VALUES (?, ?, 'EMAIL_PASSWORD', ?, ?)`,
        )
        .bind(identityId, userId, email, email),

      env.appkhor_db
        .prepare(
          `INSERT INTO password_credentials (
            id,
            user_id,
            password_hash
          ) VALUES (?, ?, ?)`,
        )
        .bind(credentialId, userId, passwordHash),

      env.appkhor_db
        .prepare(
          `INSERT INTO email_verification_codes (
            id,
            user_id,
            code_hash,
            expires_at
          ) VALUES (?, ?, ?, datetime('now', '+10 minutes'))`,
        )
        .bind(
          verificationId,
          userId,
          verificationCodeHash,
        ),
    ]);

    const emailEnv = env as typeof env & {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  APP_URL?: string;
};

    let verificationEmailSent = false;

    if (emailEnv.RESEND_API_KEY && emailEnv.EMAIL_FROM) {
      try {
        await sendVerificationEmail({
  apiKey: emailEnv.RESEND_API_KEY,
  from: emailEnv.EMAIL_FROM,
  to: email,
code: verificationCode,
  appUrl: emailEnv.APP_URL,
});

        verificationEmailSent = true;
      } catch (error) {
        console.error(
          "Verification email send failed:",
          error,
        );
      }
    } else {
      console.error("Email configuration is missing.");
    }

    return Response.json(
      {
        success: true,
        emailVerificationRequired: true,
        verificationEmailSent,
        message: verificationEmailSent
          ? "ثبت‌نام انجام شد. کد تأیید به ایمیل شما ارسال شد."
          : "ثبت‌نام انجام شد، اما ارسال کد تأیید با مشکل مواجه شد.",
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