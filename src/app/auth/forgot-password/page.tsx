"use client";

import Link from "next/link";
import { type FormEventHandler, useState } from "react";

type ForgotPasswordResponse = {
  success: boolean;
  message: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data =
        (await response.json()) as ForgotPasswordResponse;

      setMessage(data.message);
      setSuccess(data.success);
    } catch {
      setMessage(
        "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
      );
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

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
            بازیابی رمز عبور
          </h1>

          <p className="mt-3 leading-7 text-zinc-500 dark:text-zinc-400">
            ایمیلت رو وارد کن تا لینک انتخاب رمز جدید برات ارسال بشه.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-bold">
              ایمیل
            </label>

            <input
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              className="h-[52px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-left outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-600 dark:focus:ring-emerald-950"
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
            disabled={isLoading}
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "در حال ارسال..."
              : "ارسال لینک بازیابی"}
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