type SendVerificationEmailParams = {
  apiKey: string;
  from: string;
  to: string;
  code: string;
  appUrl?: string;
};

type SendPasswordResetEmailParams = {
  apiKey: string;
  from: string;
  to: string;
  token: string;
  appUrl: string;
};

type ResendEmailResponse = {
  id?: string;
  message?: string;
  name?: string;
};

export async function sendVerificationEmail({
  apiKey,
  from,
  to,
  code,
  appUrl,
}: SendVerificationEmailParams): Promise<string | null> {
  let verifyUrl: string | null = null;

  if (appUrl) {
    const url = new URL("/auth/verify-email", appUrl);
    url.searchParams.set("email", to);
    verifyUrl = url.toString();
  }

  const text = [
    "سلام 👋",
    "",
    "برای تکمیل ثبت‌نام و فعال‌سازی حساب شما در اپ‌خور، کد زیر را وارد کنید:",
    "",
    code,
    "",
    "این کد فقط ۱۰ دقیقه اعتبار دارد.",
    "",
    verifyUrl
      ? `بازگشت به صفحه تأیید: ${verifyUrl}`
      : "",
    "",
    "اگر شما این درخواست را انجام نداده‌اید، این ایمیل را نادیده بگیرید.",
    "",
    "اپ‌خور — نرم‌افزار مناسب، برای کاری که می‌خوای انجام بدی",
  ]
    .filter(Boolean)
    .join("\n");

  const verifyButton = verifyUrl
    ? `
      <div style="text-align:center;margin:28px 0 6px;">
        <a
          href="${verifyUrl}"
          style="
            display:inline-block;
            background:#16a34a;
            color:#ffffff;
            text-decoration:none;
            font-weight:700;
            font-size:15px;
            padding:14px 26px;
            border-radius:12px;
          "
        >
          بازگشت به صفحه تأیید
        </a>
      </div>
    `
    : "";

  const html = `
    <!doctype html>
    <html lang="fa" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>تأیید ایمیل اپ‌خور</title>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f0fdf4;
          font-family:Tahoma,Arial,sans-serif;
          direction:rtl;
          color:#17211a;
        "
      >
        <div style="padding:32px 16px;">
          <div
            style="
              max-width:560px;
              margin:0 auto;
            "
          >
            <div
              style="
                text-align:center;
                margin-bottom:20px;
                font-size:27px;
                font-weight:900;
                color:#16a34a;
              "
            >
              اپ‌خور
            </div>

            <div
              style="
                overflow:hidden;
                background:#ffffff;
                border:1px solid #dcfce7;
                border-radius:22px;
                box-shadow:0 18px 50px rgba(22,101,52,0.08);
              "
            >
              <div
                style="
                  height:6px;
                  background:#16a34a;
                "
              ></div>

              <div style="padding:34px 30px;">
                <div
                  style="
                    width:58px;
                    height:58px;
                    margin:0 auto 22px;
                    border-radius:50%;
                    background:#dcfce7;
                    color:#15803d;
                    font-size:28px;
                    font-weight:900;
                    line-height:58px;
                    text-align:center;
                  "
                >
                  ✓
                </div>

                <h1
                  style="
                    margin:0;
                    text-align:center;
                    font-size:24px;
                    line-height:1.7;
                    color:#17211a;
                  "
                >
                  تأیید ایمیل در اپ‌خور
                </h1>

                <p
                  style="
                    margin:24px 0 0;
                    font-size:15px;
                    line-height:2;
                    color:#52525b;
                  "
                >
                  سلام 👋
                  <br />
                  برای تکمیل ثبت‌نام و فعال‌سازی حساب شما در اپ‌خور،
                  کد تأیید زیر را وارد کنید:
                </p>

                <div
                  style="
                    margin:26px 0;
                    padding:20px;
                    border:2px dashed #86efac;
                    border-radius:16px;
                    background:#f0fdf4;
                    text-align:center;
                  "
                >
                  <div
                    style="
                      direction:ltr;
                      font-family:Arial,sans-serif;
                      font-size:34px;
                      font-weight:900;
                      letter-spacing:9px;
                      color:#15803d;
                    "
                  >
                    ${code}
                  </div>
                </div>

                <p
                  style="
                    margin:0;
                    text-align:center;
                    font-size:14px;
                    line-height:1.9;
                    color:#71717a;
                  "
                >
                  این کد فقط
                  <strong style="color:#166534;">۱۰ دقیقه</strong>
                  اعتبار دارد.
                </p>

                ${verifyButton}

                <div
                  style="
                    margin-top:26px;
                    padding:16px 18px;
                    border-radius:14px;
                    background:#f7fee7;
                    font-size:13px;
                    line-height:1.9;
                    color:#4d7c0f;
                  "
                >
                  اگر شما این ثبت‌نام را انجام نداده‌اید، نیازی به انجام
                  کاری نیست و می‌توانید این ایمیل را نادیده بگیرید.
                </div>
              </div>
            </div>

            <p
              style="
                margin:22px 0 0;
                text-align:center;
                font-size:12px;
                line-height:1.9;
                color:#6b7280;
              "
            >
              اپ‌خور — نرم‌افزار مناسب، برای کاری که می‌خوای انجام بدی
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "AppKhor/1.0",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "کد تأیید حساب اپ‌خور",
      text,
      html,
    }),
  });

  const data = (await response.json()) as ResendEmailResponse;

  if (!response.ok) {
    throw new Error(
      data.message || data.name || "Resend request failed.",
    );
  }

  return data.id ?? null;
}

export async function sendPasswordResetEmail({
  apiKey,
  from,
  to,
  token,
  appUrl,
}: SendPasswordResetEmailParams): Promise<string | null> {
  const resetUrl = new URL("/auth/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);

  const resetUrlString = resetUrl.toString();

  const text = [
    "سلام 👋",
    "",
    "برای انتخاب رمز عبور جدید، لینک زیر را باز کنید:",
    "",
    resetUrlString,
    "",
    "این لینک فقط برای مدت محدودی معتبر است.",
    "",
    "اگر شما درخواست بازیابی رمز نداده‌اید، این ایمیل را نادیده بگیرید.",
    "",
    "اپ‌خور — نرم‌افزار مناسب، برای کاری که می‌خوای انجام بدی",
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="fa" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>بازیابی رمز عبور اپ‌خور</title>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f0fdf4;
          font-family:Tahoma,Arial,sans-serif;
          direction:rtl;
          color:#17211a;
        "
      >
        <div style="padding:32px 16px;">
          <div
            style="
              max-width:560px;
              margin:0 auto;
            "
          >
            <div
              style="
                text-align:center;
                margin-bottom:20px;
                font-size:27px;
                font-weight:900;
                color:#16a34a;
              "
            >
              اپ‌خور
            </div>

            <div
              style="
                overflow:hidden;
                background:#ffffff;
                border:1px solid #dcfce7;
                border-radius:22px;
                box-shadow:0 18px 50px rgba(22,101,52,0.08);
              "
            >
              <div
                style="
                  height:6px;
                  background:#16a34a;
                "
              ></div>

              <div style="padding:34px 30px;text-align:center;">
                <div
                  style="
                    width:58px;
                    height:58px;
                    margin:0 auto 22px;
                    border-radius:50%;
                    background:#dcfce7;
                    color:#15803d;
                    font-size:26px;
                    font-weight:900;
                    line-height:58px;
                    text-align:center;
                  "
                >
                  ↻
                </div>

                <h1
                  style="
                    margin:0;
                    font-size:24px;
                    line-height:1.7;
                    color:#17211a;
                  "
                >
                  بازیابی رمز عبور
                </h1>

                <p
                  style="
                    margin:20px 0 0;
                    color:#52525b;
                    line-height:2;
                    font-size:15px;
                  "
                >
                  برای انتخاب رمز عبور جدید، روی دکمه زیر بزن.
                </p>

                <div style="margin-top:26px;">
                  <a
                    href="${resetUrlString}"
                    style="
                      display:inline-block;
                      padding:14px 26px;
                      border-radius:12px;
                      background:#16a34a;
                      color:#ffffff;
                      text-decoration:none;
                      font-weight:700;
                      font-size:15px;
                    "
                  >
                    انتخاب رمز عبور جدید
                  </a>
                </div>

                <div
                  style="
                    margin-top:28px;
                    padding:16px 18px;
                    border-radius:14px;
                    background:#f7fee7;
                    color:#4d7c0f;
                    font-size:13px;
                    line-height:1.9;
                    text-align:right;
                  "
                >
                  اگر شما درخواست بازیابی رمز نداده‌اید، نیازی به انجام
                  کاری نیست و می‌توانید این ایمیل را نادیده بگیرید.
                </div>
              </div>
            </div>

            <p
              style="
                margin:22px 0 0;
                text-align:center;
                font-size:12px;
                line-height:1.9;
                color:#6b7280;
              "
            >
              اپ‌خور — نرم‌افزار مناسب، برای کاری که می‌خوای انجام بدی
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "AppKhor/1.0",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "بازیابی رمز عبور اپ‌خور",
      text,
      html,
    }),
  });

  const data = (await response.json()) as ResendEmailResponse;

  if (!response.ok) {
    throw new Error(
      data.message || data.name || "Resend request failed.",
    );
  }

  return data.id ?? null;
}