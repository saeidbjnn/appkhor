


"use client";

import Link from "next/link";
import { type SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "motion/react";

type AuthMode = "login" | "register";

type AuthResponse = {
  success: boolean;
  message: string;
  emailVerificationRequired?: boolean;
  verificationEmailSent?: boolean;
};

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [transitionTarget, setTransitionTarget] = useState<AuthMode | null>(null);
  const [isModeSwitching, setIsModeSwitching] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const passwordChecks = {
  minLength: password.length >= 8,
  maxLength: password.length <= 128,
  lowercase: /[a-z]/.test(password),
  uppercase: /[A-Z]/.test(password),
  number: /[0-9]/.test(password),
  symbol: /[^a-zA-Z0-9]/.test(password),
  };

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (mode === "login") {
      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = (await response.json()) as AuthResponse;

        setMessage(data.message);
        setSuccess(data.success);

        if (data.success) {
  router.push("/auth/enter");
  return;
}

        if (data.emailVerificationRequired) {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(email)}`,
          );
        }
      } catch {
        setMessage(
          "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
        );
        setSuccess(false);
      } finally {
        setIsLoading(false);
      }

      return;
    }

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

      const data = (await response.json()) as AuthResponse;

      setMessage(data.message);
      setSuccess(data.success);

      if (data.success && data.emailVerificationRequired) {
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(email)}`,
        );
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

  function changeMode(newMode: AuthMode) {
    if (newMode === mode || isModeSwitching) {
      return;
    }

    setTransitionTarget(newMode);
    setIsModeSwitching(true);

    window.setTimeout(() => {
      setMode(newMode);
      setMessage("");
      setSuccess(false);
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setIsModeSwitching(false);
      setTransitionTarget(null);
    }, 2000);
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-[#082f23] px-4 py-4 text-zinc-900 lg:h-dvh lg:overflow-hidden"
    >
      {/* حباب‌های متحرک پس‌زمینه */}
      <div className="appkhor-bubble pointer-events-none absolute -left-16 top-14 h-44 w-44 rounded-full border border-emerald-100/15 bg-emerald-200/[0.035] shadow-[inset_0_0_55px_rgba(167,243,208,0.06)]" />

      <div className="appkhor-bubble-slow pointer-events-none absolute bottom-6 left-8 h-72 w-72 rounded-full border border-emerald-100/10 bg-emerald-200/[0.025] shadow-[inset_0_0_70px_rgba(167,243,208,0.05)]" />

      <div className="appkhor-bubble-slow pointer-events-none absolute -right-20 top-12 h-64 w-64 rounded-full border border-white/10 bg-white/[0.02]" />

      <div className="appkhor-bubble pointer-events-none absolute bottom-8 right-16 h-40 w-40 rounded-full border border-emerald-100/10 bg-emerald-200/[0.025]" />

      <div className="appkhor-bubble-slow pointer-events-none absolute left-[45%] top-10 h-24 w-24 rounded-full border border-white/5 bg-white/[0.02]" />

      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/[0.05] blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-emerald-300/[0.04] blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-2rem)] max-w-6xl items-start justify-center lg:h-full lg:min-h-0 lg:items-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.38)] lg:h-full lg:max-h-[720px] lg:grid-cols-2">
          {/* بخش معرفی + شفق */}
          <section className="relative hidden h-full min-h-0 overflow-hidden bg-[#e2ece4] p-10 text-[#173522] lg:flex lg:flex-col lg:justify-between">
            {/* شفق لایه‌ای */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
  {/* فیلتر موج طبیعی شفق */}
  <svg
    className="absolute h-0 w-0"
    aria-hidden="true"
  >
    <defs>
      <filter
        id="appkhor-aurora-wave"
        x="-30%"
        y="-30%"
        width="160%"
        height="190%"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.006 0.02"
          numOctaves="2"
          seed="8"
          result="noise"
        >
          <animate
            attributeName="baseFrequency"
            values="
              0.006 0.020;
              0.010 0.030;
              0.007 0.024;
              0.006 0.020
            "
            dur="20s"
            repeatCount="indefinite"
          />
        </feTurbulence>

        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="65"
          xChannelSelector="R"
          yChannelSelector="G"
        >
          <animate
            attributeName="scale"
            values="55;90;70;55"
            dur="16s"
            repeatCount="indefinite"
          />
        </feDisplacementMap>
      </filter>
    </defs>
  </svg>

  {/* پرده اصلی شفق */}
  <div
    className="appkhor-aurora absolute -left-[28%] -top-[10%] h-[78%] w-[155%]"
    style={{
      background: `
        repeating-linear-gradient(
          96deg,
          rgba(16,185,129,0) 0%,
          rgba(16,185,129,0) 4%,

          rgba(110,231,183,0.32) 7%,
          rgba(52,211,153,0.62) 10%,
          rgba(16,185,129,0.30) 14%,

          rgba(16,185,129,0) 18%,
          rgba(16,185,129,0) 24%,

          rgba(167,243,208,0.24) 28%,
          rgba(52,211,153,0.56) 32%,
          rgba(110,231,183,0.28) 36%,

          rgba(16,185,129,0) 41%
        )
      `,
      filter: "url(#appkhor-aurora-wave) blur(13px)",
      WebkitMaskImage:
        "linear-gradient(to bottom, transparent 0%, black 7%, black 58%, rgba(0,0,0,.65) 72%, transparent 94%)",
      maskImage:
        "linear-gradient(to bottom, transparent 0%, black 7%, black 58%, rgba(0,0,0,.65) 72%, transparent 94%)",
      mixBlendMode: "multiply",
      opacity: 0.78,
      transformOrigin: "top center",
      animationDuration: "15s",
    }}
  />

  {/* لایه روشن‌تر پشت پرده */}
  <div
    className="appkhor-aurora-soft absolute -left-[18%] top-[3%] h-[70%] w-[145%]"
    style={{
      background: `
        repeating-linear-gradient(
          88deg,
          transparent 0%,
          transparent 7%,

          rgba(209,250,229,0.20) 10%,
          rgba(110,231,183,0.38) 14%,
          rgba(167,243,208,0.18) 18%,

          transparent 23%,
          transparent 31%,

          rgba(167,243,208,0.24) 35%,
          rgba(52,211,153,0.34) 39%,
          rgba(209,250,229,0.16) 44%,

          transparent 50%
        )
      `,
      filter: "url(#appkhor-aurora-wave) blur(22px)",
      WebkitMaskImage:
        "linear-gradient(to bottom, transparent 0%, black 12%, black 55%, transparent 90%)",
      maskImage:
        "linear-gradient(to bottom, transparent 0%, black 12%, black 55%, transparent 90%)",
      mixBlendMode: "multiply",
      opacity: 0.62,
      animationDuration: "21s",
    }}
  />

  {/* لایه عمیق‌تر برای حس چندلایه */}
  <div
    className="appkhor-aurora absolute -left-[30%] top-[15%] h-[62%] w-[160%]"
    style={{
      background: `
        repeating-linear-gradient(
          101deg,
          transparent 0%,
          transparent 9%,

          rgba(5,150,105,0.18) 12%,
          rgba(52,211,153,0.30) 16%,
          rgba(16,185,129,0.15) 20%,

          transparent 26%,
          transparent 36%
        )
      `,
      filter: "url(#appkhor-aurora-wave) blur(18px)",
      WebkitMaskImage:
        "linear-gradient(to bottom, transparent 0%, black 8%, black 60%, transparent 95%)",
      maskImage:
        "linear-gradient(to bottom, transparent 0%, black 8%, black 60%, transparent 95%)",
      mixBlendMode: "multiply",
      opacity: 0.48,
      animationDuration: "25s",
      animationDelay: "-8s",
    }}
  />

  {/* هاله خیلی نرم برای یکی شدن لایه‌ها */}
  <div
    className="absolute left-[5%] top-[5%] h-[65%] w-[95%] rounded-[50%] blur-3xl"
    style={{
      background:
        "radial-gradient(ellipse at 50% 20%, rgba(110,231,183,0.18), rgba(167,243,208,0.08) 45%, transparent 72%)",
    }}
  />
</div>

            {/* اشکال خیلی ملایم داخل پنل */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[48px] border-emerald-900/[0.035]" />

            <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-emerald-300/[0.07]" />

            <div className="relative z-10">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/65 text-xl font-black text-emerald-900 shadow-sm">
                  ا
                </span>

                <div>
                  <strong className="block text-2xl font-black">
                    اپ‌خور
                  </strong>

                  <span className="text-sm font-medium text-emerald-900/65">
                    نرم‌افزار مناسب، برای کاری که می‌خوای انجام بدی
                  </span>
                </div>
              </Link>

              <div className="mt-10 max-w-md">
                <h1 className="text-4xl font-black leading-[1.5]">
                  حساب اپ‌خور،
                  <br />
                  برای تجربه شخصی‌تر
                </h1>

                <p className="mt-5 text-[15px] font-medium leading-8 text-emerald-950/75">
                  اپ‌ها را ذخیره کن، تجربه‌ات را ثبت کن و معرفی‌ها و
                  فعالیت‌های خودت را مدیریت کن.
                </p>
                {mode === "register" && (
  <div className="mt-6 rounded-2xl border border-emerald-900/10 bg-white/45 p-4 backdrop-blur-sm">
    <p className="mb-3 text-sm font-black text-emerald-950">
      رمز عبور باید این شرایط را داشته باشد:
    </p>

    <div className="space-y-2.5 text-sm font-medium">
      {[
        ["بین ۸ تا ۱۲۸ کاراکتر", passwordChecks.minLength && passwordChecks.maxLength],
        ["حداقل یک حرف کوچک انگلیسی", passwordChecks.lowercase],
        ["حداقل یک حرف بزرگ انگلیسی", passwordChecks.uppercase],
        ["حداقل یک عدد", passwordChecks.number],
        ["حداقل یک نشانه مثل _ . @", passwordChecks.symbol],
      ].map(([label, passed]) => (
        <div
          key={String(label)}
          className={`flex items-center gap-3 transition ${
            passed ? "text-emerald-800" : "text-emerald-950/55"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-black transition-all ${
              passed
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-emerald-900/20 bg-white/30 text-transparent"
            }`}
          >
            ✓
          </span>

          <span>{label}</span>
        </div>
      ))}
    </div>
  </div>
)}
              </div>
            </div>

            <p className="relative z-10 text-sm font-medium text-emerald-900/55">
              AppKhor.ir
            </p>
          </section>

          {/* بخش فرم */}
          <section className="relative min-h-0 bg-[#b7d4c0] p-5 sm:p-7 lg:h-full lg:overflow-hidden lg:p-8">
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-800/[0.045]" />

            <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full border-[38px] border-emerald-900/[0.04]" />

            <div className="relative z-10 mx-auto flex max-w-md flex-col py-2 lg:h-full lg:justify-center lg:py-0">
              <Link
                href="/"
                className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-700 transition hover:text-emerald-800 lg:hidden"
              >
                بازگشت به اپ‌خور
              </Link>

              <div className="mb-5">
                <h2 className="text-3xl font-black text-[#17211a]">
                  {mode === "login"
                    ? "ورود به اپ‌خور"
                    : "ساخت حساب کاربری"}
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-zinc-700">
                  {mode === "login"
                    ? "برای ادامه وارد حساب کاربری خودت شو."
                    : "در چند لحظه حساب اپ‌خور خودت را بساز."}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-2xl bg-white/45 p-1">
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    mode === "login"
                      ? "bg-white/90 text-emerald-800 shadow-sm"
                      : "text-zinc-700 hover:bg-white/30"
                  }`}
                >
                  ورود
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    mode === "register"
                      ? "bg-white/90 text-emerald-800 shadow-sm"
                      : "text-zinc-700 hover:bg-white/30"
                  }`}
                >
                  ثبت‌نام
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.a
                  href="/api/auth/google"
                  aria-label="ورود با Google"
                  whileHover={{ y: -2, scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 24,
                  }}
                  className="group relative flex h-11 items-center justify-center overflow-hidden rounded-xl border border-emerald-900/10 bg-white/55 text-sm font-bold text-zinc-700 shadow-sm outline-none transition-[border-color,box-shadow,color] duration-300 hover:border-transparent hover:text-white hover:shadow-[0_12px_30px_-12px_rgba(66,133,244,0.6)] focus-visible:ring-4 focus-visible:ring-white/45"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 scale-110 bg-[linear-gradient(115deg,#4285F4_0%,#4285F4_24%,#34A853_42%,#FBBC05_68%,#EA4335_100%)] opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"
                  />

                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.34),transparent_46%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)]">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:scale-105"
                      >
                        <path
                          fill="#4285F4"
                          d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.877 2.684-6.614Z"
                        />
                        <path
                          fill="#34A853"
                          d="M9 18c2.43 0 4.467-.806 5.956-2.181l-2.909-2.258c-.806.54-1.836.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M3.963 10.706A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.166.281-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.58C13.463.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z"
                        />
                      </svg>
                    </span>

                    <span className="transition-all duration-300 group-hover:tracking-[0.02em]">
                      Google
                    </span>
                  </span>
                </motion.a>

                <motion.a
                  href="/api/auth/github"
                  aria-label="ورود با GitHub"
                  whileHover={{ y: -2, scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 24,
                  }}
                  className="group relative flex h-11 items-center justify-center overflow-hidden rounded-xl border border-emerald-900/10 bg-white/55 text-sm font-bold text-zinc-700 shadow-sm outline-none transition-[border-color,box-shadow,color] duration-300 hover:border-[#0d1117] hover:text-white hover:shadow-[0_12px_30px_-12px_rgba(13,17,23,0.72)] focus-visible:ring-4 focus-visible:ring-white/45"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 scale-105 bg-[#0d1117] opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"
                  />

                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-white/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                    >
                      <path d="M12 .7a11.3 11.3 0 0 0-3.57 22.02c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.58 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.11 1.16a10.8 10.8 0 0 1 5.66 0c2.16-1.46 3.1-1.16 3.1-1.16.62 1.55.23 2.7.12 2.98.72.79 1.16 1.8 1.16 3.03 0 4.34-2.64 5.29-5.15 5.57.4.35.76 1.04.76 2.1v3.1c0 .3.2.65.78.54A11.3 11.3 0 0 0 12 .7Z" />
                    </svg>

                    <span className="transition-all duration-300 group-hover:tracking-[0.02em]">
                      GitHub
                    </span>
                  </span>
                </motion.a>
              </div>

              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-emerald-900/10" />

                <span className="text-xs font-medium text-zinc-600">
                  یا با ایمیل
                </span>

                <div className="h-px flex-1 bg-emerald-900/10" />
              </div>

<form
  key={mode}
  onSubmit={handleSubmit}
  className="appkhor-auth-enter space-y-3.5"
>
                <div>
                  <label className="mb-1.5 block text-sm font-bold">
                    ایمیل
                  </label>

                  <input
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="name@example.com"
                    required
                    className="h-12 w-full rounded-xl border border-emerald-900/10 bg-[#e7f0e9]/85 px-4 text-left text-zinc-900 outline-none transition placeholder:text-zinc-500 focus:border-emerald-600 focus:bg-[#f1f6f2] focus:ring-4 focus:ring-emerald-700/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold">
                    رمز عبور
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      autoComplete={
                        mode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      required
                      className="h-12 w-full rounded-xl border border-emerald-900/10 bg-[#e7f0e9]/85 px-4 pl-14 text-left text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-[#f1f6f2] focus:ring-4 focus:ring-emerald-700/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-zinc-600 transition hover:text-emerald-800"
                    >
                      {showPassword ? "مخفی" : "نمایش"}
                    </button>
                  </div>
                </div>

                <div className="min-h-[72px]">
                  {mode === "register" ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold">
                        تکرار رمز عبور
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
                        className="h-12 w-full rounded-xl border border-emerald-900/10 bg-[#e7f0e9]/85 px-4 text-left text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-[#f1f6f2] focus:ring-4 focus:ring-emerald-700/10"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[72px] items-end justify-end pb-1">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm font-bold text-emerald-800 transition hover:text-emerald-950"
                      >
                        رمز عبور را فراموش کردم
                      </Link>
                    </div>
                  )}
                </div>

                <div className="min-h-[44px]">
                  {message && (
                    <div
                      className={`rounded-xl px-4 py-2.5 text-sm leading-6 ${
                        success
                          ? "bg-emerald-50/90 text-emerald-800"
                          : "bg-red-50/90 text-red-700"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0f6b4f] px-5 font-black text-white shadow-[0_10px_25px_-12px_rgba(15,107,79,0.65)] transition hover:bg-[#0b5b43] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading
                    ? "لطفاً صبر کنید..."
                    : mode === "login"
                      ? "ورود"
                      : "ساخت حساب"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs font-medium leading-5 text-zinc-600">
                با ادامه، قوانین استفاده و حریم خصوصی اپ‌خور را
                می‌پذیرید.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* ترنزیشن ۲ ثانیه‌ای بین ورود و ثبت‌نام */}
      {isModeSwitching && transitionTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#03110c]/85 backdrop-blur-[8px]">
          <div className="flex flex-col items-center">
            <div className="relative h-30 w-30">
              {/* سه نقطه پشت گربه */}
              <div
                dir="ltr"
                className="absolute right-full top-1/2 mr-3 flex -translate-y-1/2 items-center gap-1.5"
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-100/55"
                  style={{
                    animationDuration: "650ms",
                    animationDelay: "0ms",
                  }}
                />
                <span
                  className="h-2 w-2 animate-pulse rounded-full bg-emerald-100/70"
                  style={{
                    animationDuration: "650ms",
                    animationDelay: "150ms",
                  }}
                />
                <span
                  className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-100/90"
                  style={{
                    animationDuration: "650ms",
                    animationDelay: "300ms",
                  }}
                />
              </div>

              <DotLottieReact
                src="/animations/running-cat.lottie"
                autoplay
                loop
                className="h-30 w-30"
              />
            </div>

            <p className="mt-4 text-sm font-black text-emerald-50">
              {transitionTarget === "register"
                ? "بریم که ثبتت کنیم"
                : "بریم داخل، زودتر!"}
            </p>
          </div>
        </div>
      )}
   {isEntering && (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#03110c]/88 backdrop-blur-[9px]">
    <div className="flex flex-col items-center">
      <DotLottieReact
        src="/animations/login-loading.lottie"
        autoplay
        loop
        className="h-33 w-33"
      />

      <p className="-mt-2 text-sm font-black text-emerald-50">
        در حال ورود...
      </p>
    </div>
  </div>
)} </main>
  );
}