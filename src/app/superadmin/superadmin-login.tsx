"use client";

import { FormEvent, useState } from "react";

type Step = "email" | "code";

export default function SuperadminLogin() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/superadmin/request-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        setError(data.message || "ارسال کد ورود انجام نشد.");
        return;
      }

      setMessage(
        data.message || "اگر ایمیل مجاز باشد، کد ورود ارسال می‌شود.",
      );
      setStep("code");
    } catch {
      setError("در ارتباط با سرور مشکلی پیش آمد.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/superadmin/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        setError(data.message || "کد ورود معتبر نیست.");
        return;
      }

      window.location.replace("/superadmin");
    } catch {
      setError("در ارتباط با سرور مشکلی پیش آمد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#07120c] px-4 text-zinc-100"
    >
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-black text-white">
            ا
          </div>

          <h1 className="mt-5 text-2xl font-black">
            ورود به مدیریت اپ‌خور
          </h1>

          <p className="mt-2 text-sm leading-7 text-zinc-400">
            ورود فقط با ایمیل مجاز و کد یک‌بارمصرف انجام می‌شود.
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={requestCode} className="space-y-5">
            <div>
              <label
                htmlFor="superadmin-email"
                className="mb-2 block text-sm font-bold text-zinc-300"
              >
                ایمیل
              </label>

              <input
                id="superadmin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                dir="ltr"
                placeholder="name@example.com"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-left text-sm outline-none transition placeholder:text-zinc-600 focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "در حال ارسال..." : "ارسال کد ورود"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-5">
            <div>
              <label
                htmlFor="superadmin-code"
                className="mb-2 block text-sm font-bold text-zinc-300"
              >
                کد ۶ رقمی
              </label>

              <input
                id="superadmin-code"
                type="text"
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                dir="ltr"
                placeholder="000000"
                className="h-14 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-center text-2xl font-black tracking-[0.45em] outline-none transition placeholder:text-zinc-700 focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="h-12 w-full rounded-xl bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "در حال بررسی..." : "ورود"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
                setMessage("");
              }}
              className="w-full text-sm font-bold text-zinc-400 transition hover:text-white"
            >
              تغییر ایمیل
            </button>
          </form>
        )}

        {message && (
          <div className="mt-5 rounded-xl border border-emerald-800/40 bg-emerald-950/40 px-4 py-3 text-sm leading-7 text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm leading-7 text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
