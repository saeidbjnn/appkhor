"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEventHandler,
  useEffect,
  useState,
} from "react";

type VerifyResponse = {
  success: boolean;
  verified?: boolean;
  authenticated?: boolean;
  message: string;
};

type ResendResponse = {
  success: boolean;
  alreadyVerified?: boolean;
  message: string;
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!email) {
      setMessage("ایمیل الزامی است.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage("کد تأیید باید ۶ رقم باشد.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = (await response.json()) as VerifyResponse;

      setMessage(data.message);
      setSuccess(data.success);

      if (data.success && data.verified) {
  setCode("");

  if (data.authenticated) {
    router.push("/");
    router.refresh();
    return;
  }

  setVerified(true);
}
    } catch {
      setMessage(
        "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
      );
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  async function handleResend() {
    if (!email || isResending) {
      return;
    }

    setIsResending(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
        "/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        },
      );

      const data = (await response.json()) as ResendResponse;

      setMessage(data.message);
      setSuccess(data.success);

      if (data.success && data.alreadyVerified) {
        setVerified(true);
      }
    } catch {
      setMessage(
        "ارسال مجدد کد انجام نشد. دوباره تلاش کنید.",
      );
      setSuccess(false);
    } finally {
      setIsResending(false);
    }
  }

  if (verified) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f4f8f4] px-4 py-8 text-zinc-900 dark:bg-[#07120c] dark:text-zinc-100"
      >
        <section className="w-full max-w-md rounded-[2rem] border border-emerald-950/10 bg-white p-8 text-center shadow-[0_30px_90px_-45px_rgba(20,83,45,0.4)] dark:border-white/10 dark:bg-[#0b1c12] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>

          <h1 className="mt-6 text-2xl font-black">
            ایمیلت تأیید شد
          </h1>

          <p className="mt-3 leading-7 text-zinc-500 dark:text-zinc-400">
            حساب اپ‌خور شما فعال شد و حالا می‌تونی وارد حسابت بشی.
          </p>

          <Link
            href="/auth"
            className="mt-7 flex h-[52px] w-full items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white transition hover:bg-emerald-800"
          >
            ورود به حساب
          </Link>

          <Link
            href="/"
            className="mt-4 inline-block text-sm font-bold text-zinc-400 transition hover:text-emerald-700"
          >
            بازگشت به صفحه اصلی
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#f4f8f4] px-4 py-8 text-zinc-900 dark:bg-[#07120c] dark:text-zinc-100"
    >
      <section className="w-full max-w-md rounded-[2rem] border border-emerald-950/10 bg-white p-7 shadow-[0_30px_90px_-45px_rgba(20,83,45,0.4)] dark:border-white/10 dark:bg-[#0b1c12] sm:p-10">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-black text-white"
          >
            ا
          </Link>

          <h1 className="mt-6 text-3xl font-black">
            تأیید ایمیل
          </h1>

          <p className="mt-3 leading-7 text-zinc-500 dark:text-zinc-400">
            کد ۶ رقمی ارسال‌شده به ایمیلت رو وارد کن.
          </p>

          {email && (
            <p
              dir="ltr"
              className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-400"
            >
              {email}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {!email && (
            <div>
              <label className="mb-2 block text-sm font-bold">
                ایمیل
              </label>

              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="name@example.com"
                required
                className="h-[52px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-left outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-600 dark:focus:ring-emerald-950"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold">
              کد تأیید
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              maxLength={6}
              value={code}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setCode(value);
              }}
              placeholder="123456"
              required
              className="h-16 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-center text-2xl font-black tracking-[0.5em] outline-none transition placeholder:text-zinc-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-600 dark:focus:ring-emerald-950"
            />
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm leading-7 ${
                success
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "در حال بررسی..." : "تأیید ایمیل"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email}
            className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          >
            {isResending
              ? "در حال ارسال..."
              : "ارسال مجدد کد"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-6 text-zinc-400">
          کد تأیید فقط ۱۰ دقیقه اعتبار دارد.
        </p>

        <Link
          href="/auth"
          className="mt-3 block text-center text-sm font-bold text-zinc-400 transition hover:text-emerald-700"
        >
          بازگشت به ورود
        </Link>
      </section>
    </main>
  );
}