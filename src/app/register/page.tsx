"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Theme = "light" | "dark";

type RegisterResponse = {
  success: boolean;
  message: string;
};

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.1 2.8" />
      <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 4.1-.8" />
    </svg>
  );
}

export default function RegisterPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "appkhor-theme",
    ) as Theme | null;

    const systemTheme: Theme = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme ?? systemTheme;

    setTheme(initialTheme);
    document.documentElement.style.colorScheme = initialTheme;
    setMounted(true);
  }, []);

  function toggleTheme() {
    const newTheme: Theme = isDark ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("appkhor-theme", newTheme);
    document.documentElement.style.colorScheme = newTheme;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
        }),
      });

      const data = (await response.json()) as RegisterResponse;

      setMessage(data.message);
      setSuccess(data.success);

      if (data.success) {
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = `h-[52px] w-full rounded-xl border px-4 text-left outline-none transition ${
    isDark
      ? "border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-950"
      : "border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
  }`;

  const eyeButtonClass = `absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition ${
    isDark
      ? "text-zinc-400 hover:bg-white/10 hover:text-white"
      : "text-zinc-400 hover:bg-emerald-50 hover:text-emerald-700"
  }`;

  return (
    <main
      dir="rtl"
      className={`min-h-screen px-5 py-10 transition-colors duration-300 ${
        isDark
          ? "bg-[#07120c] text-zinc-100"
          : "bg-[#f4f8f4] text-[#17211a]"
      }`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div
          className={`grid w-full overflow-hidden rounded-[2rem] border shadow-[0_30px_90px_-45px_rgba(20,83,45,0.4)] lg:grid-cols-2 ${
            isDark
              ? "border-white/10 bg-[#0b1c12]"
              : "border-emerald-950/10 bg-white"
          }`}
        >
          <section className="relative hidden overflow-hidden bg-[#123c28] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[50px] border-white/5" />
            <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-emerald-400/10" />

            <div className="relative">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-emerald-900">
                  ا
                </span>

                <div>
                  <strong className="block text-2xl font-black">
                    اپ‌خور
                  </strong>

                  <span className="text-sm text-emerald-100/60">
                    اپ‌های مفید، یک‌جا
                  </span>
                </div>
              </Link>

              <h1 className="mt-20 text-4xl font-black leading-[1.5]">
                حساب کاربری خودت را
                <br />
                در اپ‌خور بساز
              </h1>

              <p className="mt-5 max-w-md leading-8 text-emerald-50/70">
                پس از ثبت‌نام، ایمیلت را تأیید می‌کنی و وارد داشبورد
                شخصی خودت می‌شوی.
              </p>
            </div>

            <div className="relative grid gap-3 text-sm text-emerald-50/75">
              <p>✓ ذخیره امن رمز عبور</p>
              <p>✓ تأیید واقعی ایمیل</p>
              <p>✓ دسترسی به داشبورد شخصی</p>
            </div>
          </section>

          <section className="relative p-6 sm:p-10 lg:p-14">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "حالت روشن" : "حالت شب"}
              aria-label="تغییر حالت نمایش"
              className={`absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {mounted ? (isDark ? "☀️" : "🌙") : "🌙"}
            </button>

            <div className="mx-auto max-w-md">
              <div className="mb-9">
                <Link
                  href="/"
                  className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 lg:hidden"
                >
                  بازگشت به اپ‌خور
                </Link>

                <span className="text-sm font-bold text-emerald-600">
                  ساخت حساب جدید
                </span>

                <h2 className="mt-2 text-3xl font-black">
                  ثبت‌نام در اپ‌خور
                </h2>

                <p
                  className={`mt-3 text-sm leading-7 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  ایمیل واقعی خودت و یک رمز عبور قوی وارد کن.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold"
                  >
                    ایمیل
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    dir="ltr"
                    required
                    className={inputClass}
                  />

                  <p
                    className={`mt-2 text-xs leading-6 ${
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    کد تأیید به این ایمیل فرستاده خواهد شد.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold"
                  >
                    رمز عبور
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="حداقل ۸ کاراکتر"
                      autoComplete="new-password"
                      dir="ltr"
                      required
                      minLength={8}
                      className={`${inputClass} pl-14`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword
                          ? "مخفی‌کردن رمز عبور"
                          : "نمایش رمز عبور"
                      }
                      aria-pressed={showPassword}
                      className={eyeButtonClass}
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>

                  <p
                    className={`mt-2 text-xs leading-6 ${
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    شامل حرف بزرگ، حرف کوچک، عدد و نشانه‌ای مانند _ یا @
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold"
                  >
                    تکرار رمز عبور
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="رمز عبور را دوباره وارد کن"
                      autoComplete="new-password"
                      dir="ltr"
                      required
                      minLength={8}
                      className={`${inputClass} pl-14`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current,
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "مخفی‌کردن تکرار رمز"
                          : "نمایش تکرار رمز"
                      }
                      aria-pressed={showConfirmPassword}
                      className={eyeButtonClass}
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                </div>

                {message && (
                  <div
                    role="alert"
                    className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
                      success
                        ? isDark
                          ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : isDark
                          ? "border-red-900 bg-red-950/50 text-red-300"
                          : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-[52px] w-full items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading
                    ? "در حال ثبت‌نام..."
                    : "ساخت حساب کاربری"}
                </button>
              </form>

              <div
                className={`mt-7 border-t pt-6 text-center text-sm ${
                  isDark
                    ? "border-white/10 text-zinc-400"
                    : "border-zinc-100 text-zinc-500"
                }`}
              >
                قبلاً ثبت‌نام کرده‌ای؟{" "}
                <Link
                  href="/login"
                  className="font-black text-emerald-600 hover:text-emerald-500"
                >
                  وارد حساب شو
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}