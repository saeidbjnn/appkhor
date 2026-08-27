"use client";

import Link from "next/link";
import AuthButton from "@/components/auth/auth-button";
import { useAppTheme } from "@/components/app-theme-provider";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import SiteSearchButton from "@/components/site-search-button";

type CategoryTheme = {
  lightGradient: string;
  darkGradient: string;
  lightGlow: string;
  darkGlow: string;
  lightWave: string;
  darkWave: string;
  eyebrowLight: string;
  eyebrowDark: string;
  iconLight: string;
  iconDark: string;
  cardLight: string;
  cardDark: string;
  buttonLight: string;
  buttonDark: string;
  moreLight: string;
  moreDark: string;
  moreIconLight: string;
  moreIconDark: string;
  moreTextLight: string;
  moreTextDark: string;
  transitionLight: string;
  transitionDark: string;
};

type CategoryApp = {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  description: string;
  logoUrl: string | null;
  publishedAt: string | null;
};

type CategoryData = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  icon: string | null;
  apps: CategoryApp[];
};

type CategoriesClientProps = {
  categories: CategoryData[];
};

const themePresets: CategoryTheme[] = [
  {
    lightGradient:
      "linear-gradient(180deg, #edf8f1 0%, #d7eddf 52%, #c5e7d1 100%)",
    darkGradient:
      "linear-gradient(180deg, #031009 0%, #051b11 52%, #062418 100%)",
    lightGlow:
      "radial-gradient(ellipse, rgba(5,150,105,0.24) 0%, rgba(16,185,129,0.10) 44%, transparent 72%)",
    darkGlow:
      "radial-gradient(ellipse, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.08) 44%, transparent 72%)",
    lightWave: "rgba(5,150,105,0.20)",
    darkWave: "rgba(52,211,153,0.10)",
    eyebrowLight: "text-emerald-800",
    eyebrowDark: "text-emerald-400",
    iconLight: "bg-emerald-100/90",
    iconDark: "bg-emerald-950/80",
    cardLight:
      "border-emerald-200/80 bg-white/95 shadow-[0_14px_45px_rgba(5,150,105,0.13)] hover:border-emerald-400 hover:shadow-[0_18px_60px_rgba(5,150,105,0.22)]",
    cardDark:
      "border-emerald-900/45 bg-white/[0.035] shadow-[0_14px_45px_rgba(16,185,129,0.06)] hover:border-emerald-500/50 hover:shadow-[0_18px_60px_rgba(16,185,129,0.11)]",
    buttonLight:
      "border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800",
    buttonDark:
      "border-emerald-900/50 hover:border-emerald-600 hover:bg-emerald-950/50 hover:text-emerald-300",
    moreLight:
      "border-emerald-300/80 bg-emerald-50/60 shadow-[0_14px_45px_rgba(5,150,105,0.11)] hover:border-emerald-500 hover:bg-emerald-100/70",
    moreDark:
      "border-emerald-700/35 bg-emerald-950/20 hover:border-emerald-500/60 hover:bg-emerald-950/35",
    moreIconLight: "bg-white text-emerald-700",
    moreIconDark: "bg-white/5 text-emerald-300",
    moreTextLight: "text-emerald-800",
    moreTextDark: "text-emerald-400",
    transitionLight:
      "linear-gradient(180deg, rgba(197,231,209,0) 0%, #d9ddeb 48%, #faf2ff 100%)",
    transitionDark:
      "linear-gradient(180deg, rgba(6,36,24,0) 0%, #100d18 48%, #140817 100%)",
  },
  {
    lightGradient:
      "linear-gradient(180deg, #faf2ff 0%, #f0ddfa 52%, #e7cff4 100%)",
    darkGradient:
      "linear-gradient(180deg, #140817 0%, #1c0b21 52%, #25102b 100%)",
    lightGlow:
      "radial-gradient(ellipse, rgba(192,38,211,0.20) 0%, rgba(217,70,239,0.09) 44%, transparent 72%)",
    darkGlow:
      "radial-gradient(ellipse, rgba(217,70,239,0.16) 0%, rgba(168,85,247,0.08) 44%, transparent 72%)",
    lightWave: "rgba(192,38,211,0.18)",
    darkWave: "rgba(232,121,249,0.10)",
    eyebrowLight: "text-fuchsia-800",
    eyebrowDark: "text-fuchsia-300",
    iconLight: "bg-fuchsia-100/90",
    iconDark: "bg-fuchsia-950/60",
    cardLight:
      "border-fuchsia-200/80 bg-white/95 shadow-[0_14px_45px_rgba(192,38,211,0.12)] hover:border-fuchsia-400 hover:shadow-[0_18px_60px_rgba(192,38,211,0.21)]",
    cardDark:
      "border-fuchsia-900/40 bg-white/[0.035] shadow-[0_14px_45px_rgba(232,121,249,0.05)] hover:border-fuchsia-500/50 hover:shadow-[0_18px_60px_rgba(232,121,249,0.10)]",
    buttonLight:
      "border-fuchsia-200 bg-white hover:border-fuchsia-400 hover:bg-fuchsia-50 hover:text-fuchsia-800",
    buttonDark:
      "border-fuchsia-900/50 hover:border-fuchsia-600 hover:bg-fuchsia-950/35 hover:text-fuchsia-300",
    moreLight:
      "border-fuchsia-300/80 bg-fuchsia-50/60 shadow-[0_14px_45px_rgba(192,38,211,0.10)] hover:border-fuchsia-500 hover:bg-fuchsia-100/70",
    moreDark:
      "border-fuchsia-700/30 bg-fuchsia-950/15 hover:border-fuchsia-500/55 hover:bg-fuchsia-950/30",
    moreIconLight: "bg-white text-fuchsia-700",
    moreIconDark: "bg-white/5 text-fuchsia-300",
    moreTextLight: "text-fuchsia-800",
    moreTextDark: "text-fuchsia-300",
    transitionLight:
      "linear-gradient(180deg, rgba(231,207,244,0) 0%, #f3dfd4 48%, #fff9e9 100%)",
    transitionDark:
      "linear-gradient(180deg, rgba(37,16,43,0) 0%, #1e100d 48%, #171104 100%)",
  },
  {
    lightGradient:
      "linear-gradient(180deg, #fff9e9 0%, #f8edc9 52%, #f1dfad 100%)",
    darkGradient:
      "linear-gradient(180deg, #171104 0%, #211806 52%, #2a2009 100%)",
    lightGlow:
      "radial-gradient(ellipse, rgba(217,119,6,0.18) 0%, rgba(245,158,11,0.09) 44%, transparent 72%)",
    darkGlow:
      "radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.07) 44%, transparent 72%)",
    lightWave: "rgba(217,119,6,0.18)",
    darkWave: "rgba(251,191,36,0.10)",
    eyebrowLight: "text-amber-800",
    eyebrowDark: "text-amber-300",
    iconLight: "bg-amber-100/90",
    iconDark: "bg-amber-950/55",
    cardLight:
      "border-amber-200/90 bg-white/95 shadow-[0_14px_45px_rgba(217,119,6,0.11)] hover:border-amber-400 hover:shadow-[0_18px_60px_rgba(217,119,6,0.20)]",
    cardDark:
      "border-amber-900/40 bg-white/[0.035] shadow-[0_14px_45px_rgba(251,191,36,0.05)] hover:border-amber-500/50 hover:shadow-[0_18px_60px_rgba(251,191,36,0.10)]",
    buttonLight:
      "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800",
    buttonDark:
      "border-amber-900/45 hover:border-amber-600 hover:bg-amber-950/30 hover:text-amber-300",
    moreLight:
      "border-amber-300/80 bg-amber-50/65 shadow-[0_14px_45px_rgba(217,119,6,0.09)] hover:border-amber-500 hover:bg-amber-100/75",
    moreDark:
      "border-amber-700/30 bg-amber-950/15 hover:border-amber-500/55 hover:bg-amber-950/30",
    moreIconLight: "bg-white text-amber-700",
    moreIconDark: "bg-white/5 text-amber-300",
    moreTextLight: "text-amber-800",
    moreTextDark: "text-amber-300",
    transitionLight:
      "linear-gradient(180deg, rgba(241,223,173,0) 0%, #e2e7dc 48%, #edf7ff 100%)",
    transitionDark:
      "linear-gradient(180deg, rgba(42,32,9,0) 0%, #10191a 48%, #04111a 100%)",
  },
  {
    lightGradient:
      "linear-gradient(180deg, #edf7ff 0%, #dceefb 52%, #c9e3f6 100%)",
    darkGradient:
      "linear-gradient(180deg, #04111a 0%, #061a27 52%, #082332 100%)",
    lightGlow:
      "radial-gradient(ellipse, rgba(2,132,199,0.20) 0%, rgba(14,165,233,0.09) 44%, transparent 72%)",
    darkGlow:
      "radial-gradient(ellipse, rgba(14,165,233,0.17) 0%, rgba(2,132,199,0.08) 44%, transparent 72%)",
    lightWave: "rgba(2,132,199,0.18)",
    darkWave: "rgba(56,189,248,0.10)",
    eyebrowLight: "text-sky-800",
    eyebrowDark: "text-sky-300",
    iconLight: "bg-sky-100/90",
    iconDark: "bg-sky-950/60",
    cardLight:
      "border-sky-200/90 bg-white/95 shadow-[0_14px_45px_rgba(2,132,199,0.11)] hover:border-sky-400 hover:shadow-[0_18px_60px_rgba(2,132,199,0.20)]",
    cardDark:
      "border-sky-900/40 bg-white/[0.035] shadow-[0_14px_45px_rgba(56,189,248,0.05)] hover:border-sky-500/50 hover:shadow-[0_18px_60px_rgba(56,189,248,0.10)]",
    buttonLight:
      "border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50 hover:text-sky-800",
    buttonDark:
      "border-sky-900/45 hover:border-sky-600 hover:bg-sky-950/35 hover:text-sky-300",
    moreLight:
      "border-sky-300/80 bg-sky-50/65 shadow-[0_14px_45px_rgba(2,132,199,0.09)] hover:border-sky-500 hover:bg-sky-100/75",
    moreDark:
      "border-sky-700/30 bg-sky-950/15 hover:border-sky-500/55 hover:bg-sky-950/30",
    moreIconLight: "bg-white text-sky-700",
    moreIconDark: "bg-white/5 text-sky-300",
    moreTextLight: "text-sky-800",
    moreTextDark: "text-sky-300",
    transitionLight:
      "linear-gradient(180deg, rgba(201,227,246,0) 0%, rgba(201,227,246,0.55) 55%, rgba(247,250,247,0.95) 100%)",
    transitionDark:
      "linear-gradient(180deg, rgba(8,35,50,0) 0%, rgba(8,35,50,0.55) 55%, rgba(7,18,12,0.95) 100%)",
  },
];

const categoryThemeIndex: Record<string, number> = {
  productivity: 2,
  development: 3,
  "design-creative": 1,
  multimedia: 2,
  "security-privacy": 0,
  "internet-network": 3,
};

const categoryEmoji: Record<string, string> = {
  productivity: "✅",
  development: "💻",
  "internet-network": "🌐",
  "security-privacy": "🛡️",
  multimedia: "🎬",
  "design-creative": "🎨",
  "file-management": "📁",
  "system-tools": "⚙️",
  communication: "💬",
  education: "🎓",
};

function getTheme(slug: string, index: number) {
  const presetIndex =
    categoryThemeIndex[slug] ?? index % themePresets.length;

  return themePresets[presetIndex];
}

function displayName(app: CategoryApp) {
  return app.nameFa || app.name;
}

function fallbackAppIcon(app: CategoryApp) {
  return displayName(app).trim().slice(0, 1).toUpperCase() || "ا";
}

export default function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  const { isDark, mounted, toggleTheme } = useAppTheme();
  const reduceMotion = useReducedMotion();

  return (
    <main
      dir="rtl"
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-[#07120c] text-zinc-100"
          : "bg-[#f7faf7] text-[#17211a]"
      }`}
    >
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.42,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? "border-white/10 bg-[#07120c]/90"
            : "border-emerald-950/10 bg-white/90"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-black text-white shadow-lg shadow-emerald-900/20">
              ا
            </span>

            <div>
              <strong className="block text-xl font-black">
                اپ‌خور
              </strong>

              <span
                className={`text-xs ${
                  isDark
                    ? "text-zinc-400"
                    : "text-zinc-500"
                }`}
              >
                اپ‌های مفید، یک‌جا
              </span>
            </div>
          </Link>

          <nav
            className={`hidden items-center gap-8 text-sm font-bold md:flex ${
              isDark
                ? "text-zinc-300"
                : "text-zinc-600"
            }`}
          >
            <Link
              href="/"
              className="transition hover:text-emerald-500"
            >
              صفحه اصلی
            </Link>

            <Link
              href="/categories"
              className="text-emerald-500"
            >
              دسته‌بندی‌ها
            </Link>

            <Link
              href="/apps"
              className="transition hover:text-emerald-500"
            >
              همه اپ‌ها
            </Link>

            <Link
              href="/#about"
              className="transition hover:text-emerald-500"
            >
              درباره ما
            </Link>
          </nav>
<SiteSearchButton />

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -2, rotate: -5, scale: 1.04 }
              }
              whileTap={
                reduceMotion
                  ? undefined
                  : { scale: 0.92 }
              }
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 22,
              }}
              aria-label="تغییر حالت نمایش"
              title={isDark ? "حالت روشن" : "حالت شب"}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {mounted
                ? isDark
                  ? "☀️"
                  : "🌙"
                : "🌙"}
            </motion.button>

            <motion.a
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -2, scale: 1.02 }
              }
              whileTap={
                reduceMotion
                  ? undefined
                  : { scale: 0.97 }
              }
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 24,
              }}
              href="https://reymit.ir/saeid_bjn"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden rounded-xl border px-4 py-2.5 text-sm font-bold transition sm:block ${
                isDark
                  ? "border-emerald-700/50 text-emerald-400 hover:bg-emerald-950"
                  : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              حمایت مالی
            </motion.a>

            <AuthButton />
          </div>
        </div>
      </motion.header>

      <section
        className={`relative overflow-hidden border-b ${
          isDark
            ? "border-emerald-950/80 bg-[#02150d]"
            : "border-emerald-200 bg-[#e4f4ea]"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(180deg, #02150d 0%, #052619 55%, #062d1d 100%)"
              : "linear-gradient(180deg, #edf8f1 0%, #d7eddf 55%, #c3e3cf 100%)",
          }}
        />

        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.06, 1],
                  opacity: [0.8, 1, 0.8],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-3xl"
          style={{
            background: isDark
              ? "radial-gradient(ellipse, rgba(16,185,129,0.30) 0%, rgba(5,150,105,0.14) 42%, transparent 72%)"
              : "radial-gradient(ellipse, rgba(5,150,105,0.30) 0%, rgba(16,185,129,0.16) 42%, transparent 72%)",
          }}
        />

        <div
          className="pointer-events-none absolute -bottom-32 left-1/2 h-[280px] w-[120%] -translate-x-1/2 rounded-[50%] border"
          style={{
            borderColor: isDark
              ? "rgba(52,211,153,0.14)"
              : "rgba(4,120,87,0.24)",
            boxShadow:
              "0 -30px 90px rgba(16,185,129,0.08)",
          }}
        />

        <div
          className="pointer-events-none absolute -bottom-44 left-1/2 h-[330px] w-[145%] -translate-x-1/2 rounded-[50%] border"
          style={{
            borderColor: isDark
              ? "rgba(52,211,153,0.09)"
              : "rgba(4,120,87,0.17)",
          }}
        />

        <div
          className="pointer-events-none absolute -left-24 top-4 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: isDark
              ? "rgba(5,150,105,0.14)"
              : "rgba(5,150,105,0.18)",
          }}
        />

        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: isDark
              ? "rgba(34,197,94,0.12)"
              : "rgba(4,120,87,0.16)",
          }}
        />

        <Reveal className="relative z-10 mx-auto max-w-7xl px-5 py-20 text-center lg:px-8 lg:py-24">
          <span
            className={`text-sm font-bold ${
              isDark
                ? "text-emerald-400"
                : "text-emerald-800"
            }`}
          >
            دنیای اپ‌خور
          </span>

          <h1
            className={`mt-3 text-4xl font-black sm:text-5xl ${
              isDark
                ? "text-white"
                : "text-emerald-950"
            }`}
          >
            دسته‌بندی‌ها
          </h1>

          <p
            className={`mx-auto mt-5 max-w-2xl text-base leading-8 sm:text-lg ${
              isDark
                ? "text-emerald-50/70"
                : "text-emerald-950/65"
            }`}
          >
            اپ‌ها رو بر اساس موضوع پیدا کن و سریع‌تر به ابزار موردنیازت برس.
          </p>
        </Reveal>
      </section>

      <div>
        {categories.map((category, categoryIndex) => {
          const theme = getTheme(
            category.slug,
            categoryIndex,
          );

          const visibleApps = category.apps.slice(0, 4);

          return (
            <section
              key={category.id}
              className="relative overflow-hidden"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: isDark
                    ? theme.darkGradient
                    : theme.lightGradient,
                }}
              />

              <div
                className="pointer-events-none absolute left-1/2 top-16 h-[480px] w-[940px] -translate-x-1/2 rounded-[50%] blur-3xl"
                style={{
                  background: isDark
                    ? theme.darkGlow
                    : theme.lightGlow,
                }}
              />

              <div
                className="pointer-events-none absolute -top-28 left-1/2 h-[300px] w-[125%] -translate-x-1/2 rounded-[50%] border"
                style={{
                  borderColor: isDark
                    ? theme.darkWave
                    : theme.lightWave,
                }}
              />

              <div
                className="pointer-events-none absolute -bottom-36 left-1/2 h-[320px] w-[145%] -translate-x-1/2 rounded-[50%] border"
                style={{
                  borderColor: isDark
                    ? theme.darkWave
                    : theme.lightWave,
                }}
              />

              <div className="relative z-10 mx-auto max-w-7xl px-5 pb-28 pt-16 lg:px-8">
                <Reveal className="mb-8 flex flex-col gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isDark
                        ? theme.eyebrowDark
                        : theme.eyebrowLight
                    }`}
                  >
                    دسته‌بندی
                  </span>

                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                        isDark
                          ? theme.iconDark
                          : theme.iconLight
                      }`}
                    >
                      {categoryEmoji[category.slug] ?? "◈"}
                    </span>

                    <h2 className="text-2xl font-black sm:text-3xl">
                      {category.name}
                    </h2>
                  </div>

                  <p
                    className={`max-w-3xl text-sm leading-7 ${
                      isDark
                        ? "text-zinc-400"
                        : "text-zinc-700"
                    }`}
                  >
                    {category.subtitle}
                  </p>

                  <span
                    className={`mt-1 text-xs font-bold ${
                      isDark
                        ? "text-zinc-500"
                        : "text-zinc-500"
                    }`}
                  >
                    {category.apps.length.toLocaleString("fa-IR")} اپ منتشرشده
                  </span>
                </Reveal>

                <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {visibleApps.map((app) => (
                    <StaggerItem key={app.id}>
                      <motion.article
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                                y: -8,
                                scale: 1.015,
                                rotateX: 1.2,
                                rotateY: -1.2,
                              }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 24,
                        }}
                        className={`group flex min-h-[285px] flex-col rounded-3xl border p-5 transition duration-200 ${
                          isDark
                            ? theme.cardDark
                            : theme.cardLight
                        }`}
                      >
                        <span
                          className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-2xl font-black ${
                            isDark
                              ? theme.iconDark
                              : theme.iconLight
                          }`}
                        >
                          {app.logoUrl ? (
                            <img
                              src={app.logoUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            fallbackAppIcon(app)
                          )}
                        </span>

                        <h3 className="mt-5 text-lg font-black leading-7">
                          {displayName(app)}
                        </h3>

                        {app.nameFa &&
                          app.nameFa !== app.name && (
                            <p
                              dir="ltr"
                              className={`mt-1 text-left text-xs font-semibold ${
                                isDark
                                  ? "text-zinc-500"
                                  : "text-zinc-400"
                              }`}
                            >
                              {app.name}
                            </p>
                          )}

                        <p
                          className={`mt-3 flex-1 text-sm leading-7 ${
                            isDark
                              ? "text-zinc-400"
                              : "text-zinc-700"
                          }`}
                        >
                          {app.description}
                        </p>

                        <motion.div
                          whileHover={
                            reduceMotion
                              ? undefined
                              : { y: -2, scale: 1.015 }
                          }
                          whileTap={
                            reduceMotion
                              ? undefined
                              : { scale: 0.96 }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 24,
                          }}
                          className="mt-5"
                        >
                          <Link
                            href={`/apps/${app.slug}`}
                            className={`block w-full rounded-xl border px-4 py-3 text-center text-sm font-bold transition ${
                              isDark
                                ? theme.buttonDark
                                : theme.buttonLight
                            }`}
                          >
                            مشاهده اپ
                          </Link>
                        </motion.div>
                      </motion.article>
                    </StaggerItem>
                  ))}

                  {visibleApps.length === 0 && (
                    <StaggerItem>
                      <div
                        className={`flex min-h-[285px] flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center ${
                          isDark
                            ? "border-white/10 bg-white/[0.025] text-zinc-400"
                            : "border-black/10 bg-white/45 text-zinc-600"
                        }`}
                      >
                        <span className="text-3xl">
                          {categoryEmoji[category.slug] ?? "◈"}
                        </span>

                        <h3 className="mt-4 font-black">
                          هنوز اپی منتشر نشده
                        </h3>

                        <p className="mt-2 text-sm leading-7">
                          اولین اپ این دسته به‌زودی اینجا نمایش داده می‌شود.
                        </p>
                      </div>
                    </StaggerItem>
                  )}

                  <StaggerItem>
                    <motion.div
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { y: -8, scale: 1.015 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                      }}
                      className="h-full"
                    >
                      <Link
                        href="/apps"
                        className={`group flex min-h-[285px] flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition duration-200 ${
                          isDark
                            ? theme.moreDark
                            : theme.moreLight
                        }`}
                      >
                        <motion.span
                          whileHover={
                            reduceMotion
                              ? undefined
                              : { rotate: 90, scale: 1.12 }
                          }
                          transition={{
                            type: "spring",
                            stiffness: 360,
                            damping: 20,
                          }}
                          className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl font-light transition ${
                            isDark
                              ? theme.moreIconDark
                              : theme.moreIconLight
                          }`}
                        >
                          +
                        </motion.span>

                        <h3 className="mt-5 text-lg font-black">
                          اپ‌های بیشتر
                        </h3>

                        <p
                          className={`mt-3 max-w-[190px] text-sm leading-7 ${
                            isDark
                              ? "text-zinc-400"
                              : "text-zinc-700"
                          }`}
                        >
                          همه اپ‌های منتشرشده را در فهرست اصلی اپ‌خور ببین.
                        </p>

                        <span
                          className={`mt-5 text-sm font-bold transition group-hover:-translate-x-1 ${
                            isDark
                              ? theme.moreTextDark
                              : theme.moreTextLight
                          }`}
                        >
                          مشاهده همه ←
                        </span>
                      </Link>
                    </motion.div>
                  </StaggerItem>
                </Stagger>
              </div>

              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-28"
                style={{
                  background: isDark
                    ? theme.transitionDark
                    : theme.transitionLight,
                }}
              />
            </section>
          );
        })}
      </div>
    </main>
  );
}