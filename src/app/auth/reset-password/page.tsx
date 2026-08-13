"use client";

import Link from "next/link";
import {
  type FormEventHandler,
  useEffect,
  useState,
} from "react";

type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!token) {
      setMessage("لینک بازیابی معتبر نیست.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data =
        (await response.json()) as ResetPasswordResponse;

      setMessage(data.message);
      setSuccess(data.success);

      if (data.success) {
        setPassword("");
        setConfirmPassword("");
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

  if (success) {
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
            رمز عبور تغییر کرد
          </h1>

          <p className="mt-3 leading-7 text-zinc-500 dark:text-zinc-400">
            رمز جدید با موفقیت ثبت شد. حالا می‌تونی وارد حساب بشی.
          </p>

          <Link
            href="/auth"
            className="mt-7 flex h-[52px] w-full items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white transition hover:bg-emerald-800"
          >
            ورود به حساب
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
            انتخاب رمز عبور جدید
          </h1>

          <p className="mt-3 leading-7 text-zinc-500 dark:text-zinc-400">
            رمز جدیدت رو وارد کن تا جایگزین رمز قبلی بشه.
          </p>
        </div>

        {!token && (
          <div className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm leading-7 text-red-700 dark:bg-red-950/40 dark:text-red-300">
            لینک بازیابی معتبر نیست یا توکن داخل آدرس وجود ندارد.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-bold">
              رمز عبور جدید
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                disabled={!token}
                className="h-[52px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 pl-14 text-left outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-600 dark:focus:ring-emerald-950"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-zinc-400 hover:text-emerald-700"
              >
                {showPassword ? "مخفی" : "نمایش"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              تکرار رمز عبور جدید
            </label>

            <input
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              disabled={!token}
              className="h-[52px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-left outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-600 dark:focus:ring-emerald-950"
            />
          </div>

          <p className="text-xs leading-6 text-zinc-400">
            رمز عبور باید حداقل ۸ کاراکتر و شامل حرف بزرگ، حرف کوچک و عدد باشد.
          </p>

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
            disabled={isLoading || !token}
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "در حال تغییر..."
              : "ثبت رمز عبور جدید"}
          </button>
        </form>

        <Link
          href="/auth"
          className="mt-6 block text-center text-sm font-bold text-zinc-400 transition hover:text-emerald-700"
        >
          بازگشت به ورود
        </Link>
      </section>
    </main>
  );
}