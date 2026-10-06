"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { useDevicePlatform } from "@/hooks/use-device-platform";
import AuthButton from "@/components/auth/auth-button";
import LanguageSwitcher from "@/components/language-switcher";
import { useAppTheme } from "@/components/app-theme-provider";
import SiteSearchButton from "@/components/site-search-button";

import type {
  AppCategory,
  AppDetailData,
  AppHighlight,
  AppOfficialLink,
  AppPlatform,
  AppScreenshot,
  RelatedApp,
} from "./page";

type AppDetailClientProps = {
  app: AppDetailData;
  categories: AppCategory[];
  platforms: AppPlatform[];
  links: AppOfficialLink[];
  screenshots: AppScreenshot[];
  highlights: AppHighlight[];
  relatedApps: RelatedApp[];
  locale?: "fa" | "en";
};

function formatLinkType(
  type: string,
  locale: "fa" | "en",
): string {
  const isEnglish = locale === "en";

  switch (type) {
    case "DOWNLOAD":
      return isEnglish
        ? "Download"
        : "\u062f\u0627\u0646\u0644\u0648\u062f";

    case "RUN":
      return isEnglish
        ? "Run"
        : "\u0627\u062c\u0631\u0627";

    case "WEBSITE":
      return isEnglish
        ? "Website"
        : "\u0648\u0628\u200c\u0633\u0627\u06cc\u062a";

    case "SOURCE":
      return isEnglish
        ? "Source code"
        : "\u06a9\u062f \u0645\u0646\u0628\u0639";

    case "DOCS":
      return isEnglish
        ? "Documentation"
        : "\u0645\u0633\u062a\u0646\u062f\u0627\u062a";

    case "STORE":
      return isEnglish
        ? "Store"
        : "\u0641\u0631\u0648\u0634\u06af\u0627\u0647";

    default:
      return isEnglish
        ? "Official link"
        : "\u0644\u06cc\u0646\u06a9 \u0631\u0633\u0645\u06cc";
  }
}

function formatPlatformName(
  slug: string | null,
  locale: "fa" | "en",
): string | null {
  const isEnglish = locale === "en";

  switch (slug) {
    case "android":
      return isEnglish ? "Android" : "\u0627\u0646\u062f\u0631\u0648\u06cc\u062f";
    case "ios":
      return "iOS";
    case "windows":
      return isEnglish ? "Windows" : "\u0648\u06cc\u0646\u062f\u0648\u0632";
    case "macos":
      return "macOS";
    case "linux":
      return isEnglish ? "Linux" : "\u0644\u06cc\u0646\u0648\u06a9\u0633";
    default:
      return null;
  }
}

function displayName(app: AppDetailData | RelatedApp) {
  return app.nameFa || app.name;
}

function fallbackIcon(app: AppDetailData | RelatedApp) {
  return displayName(app).trim().slice(0, 1).toUpperCase() || "\u0627";
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export default function AppDetailClient({
  app,
  categories,
  platforms,
  links,
  screenshots,
  highlights,
  relatedApps,
  locale = "fa",
}: AppDetailClientProps) {
  const { isDark, mounted, toggleTheme } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const devicePlatform = useDevicePlatform();
  const isEnglish = locale === "en";
  const localePath = (path: string) =>
    isEnglish ? `/en${path === "/" ? "" : path}` : path;
  const localizedNumber = (value: number) =>
    value.toLocaleString(isEnglish ? "en-US" : "fa-IR");
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const detectedPlatformName = formatPlatformName(devicePlatform, locale);

  const deviceDownloadLink = useMemo(() => {
    if (!devicePlatform) {
      return null;
    }

    const candidates = links.filter(
      (item) =>
        item.type === "DOWNLOAD" &&
        item.platformSlug === devicePlatform,
    );

    return candidates.length === 1
      ? candidates[0]
      : null;
  }, [devicePlatform, links]);

  const primaryLink = useMemo(() => {
    if (deviceDownloadLink) {
      return deviceDownloadLink;
    }

    return (
      links.find((item) => item.isPrimary) ??
      links.find(
        (item) =>
          item.type === "DOWNLOAD" && item.platformSlug === null,
      ) ??
      links.find((item) => item.type === "RUN") ??
      links.find((item) => item.type === "WEBSITE") ??
      links[0]
    );
  }, [deviceDownloadLink, links]);

  const displayedLinks = useMemo(() => {
    if (!deviceDownloadLink) {
      return links;
    }

    return [
      deviceDownloadLink,
      ...links.filter((item) => item.id !== deviceDownloadLink.id),
    ];
  }, [deviceDownloadLink, links]);

  const primaryButtonLabel = useMemo(() => {
    if (!primaryLink) {
      return "";
    }

    if (
      deviceDownloadLink &&
      primaryLink.id === deviceDownloadLink.id &&
      detectedPlatformName
    ) {
      return isEnglish
        ? `Download for ${detectedPlatformName}`
        : `\u062f\u0627\u0646\u0644\u0648\u062f \u0628\u0631\u0627\u06cc ${detectedPlatformName}`;
    }

    return primaryLink.label;
  }, [
    detectedPlatformName,
    deviceDownloadLink,
    isEnglish,
    primaryLink,
  ]);

  const descriptionParagraphs = useMemo(() => {
    const source = app.description?.trim() || app.shortDescription;

    return source
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [app.description, app.shortDescription]);

  const selectedScreenshot =
    screenshots[activeScreenshot] ?? screenshots[0];

  return (
    <main
      dir={isEnglish ? "ltr" : "rtl"}
      className={`min-h-screen overflow-hidden transition-colors duration-300 ${
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
          <Link
            href={localePath("/")}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-black text-white shadow-lg shadow-emerald-900/20">
              {isEnglish ? "A" : "\u0627"}
            </span>

            <div>
              <strong className="block text-xl font-black">
                {isEnglish
                  ? "AppKhor"
                  : "\u0627\u067e\u200c\u062e\u0648\u0631"}
              </strong>

              <span
                className={`text-xs ${isDark
                  ? "text-zinc-400"
                  : "text-zinc-500"}`}
              >
                {isEnglish
                  ? "Useful apps, all in one place"
                  : "\u0627\u067e\u200c\u0647\u0627\u06cc \u0645\u0641\u06cc\u062f\u060c \u06cc\u06a9\u200c\u062c\u0627"}
              </span>
            </div>
          </Link>

          <nav
            className={`hidden items-center gap-8 text-sm font-bold md:flex ${isDark
              ? "text-zinc-300"
              : "text-zinc-600"}`}
          >
            <Link
              href={localePath("/")}
              className="transition hover:text-emerald-500"
            >
              {isEnglish
                ? "Home"
                : "\u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc"}
            </Link>

            <Link
              href={localePath("/categories")}
              className="transition hover:text-emerald-500"
            >
              {isEnglish
                ? "Categories"
                : "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
            </Link>

            <Link
              href={localePath("/apps")}
              className="text-emerald-500"
            >
              {isEnglish
                ? "All apps"
                : "\u0647\u0645\u0647 \u0627\u067e\u200c\u0647\u0627"}
            </Link>

            <Link
              href={`${localePath("/")}#about`}
              className="transition hover:text-emerald-500"
            >
              {isEnglish
                ? "About"
                : "\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627"}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <SiteSearchButton />

            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -2,
                      rotate: -5,
                      scale: 1.04,
                    }
              }
              whileTap={
                reduceMotion ? undefined : { scale: 0.92 }
              }
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 22,
              }}
              aria-label={
                isEnglish
                  ? "Change display mode"
                  : "\u062a\u063a\u06cc\u06cc\u0631 \u062d\u0627\u0644\u062a \u0646\u0645\u0627\u06cc\u0634"
              }
              title={
                isDark
                  ? isEnglish
                    ? "Light mode"
                    : "\u062d\u0627\u0644\u062a \u0631\u0648\u0634\u0646"
                  : isEnglish
                    ? "Dark mode"
                    : "\u062d\u0627\u0644\u062a \u0634\u0628"
              }
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {mounted ? (isDark ? "\u2600\uFE0F" : "\u{1F319}") : "\u{1F319}"}
            </motion.button>

            <motion.a
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -2, scale: 1.02 }
              }
              whileTap={
                reduceMotion ? undefined : { scale: 0.97 }
              }
              href="https://reymit.ir/saeid_bjn"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden rounded-xl border px-4 py-2.5 text-sm font-bold transition sm:block ${
                isDark
                  ? "border-emerald-700/50 text-emerald-400 hover:bg-emerald-950"
                  : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              {isEnglish
                ? "Support"
                : "\u062d\u0645\u0627\u06cc\u062a \u0645\u0627\u0644\u06cc"}
            </motion.a>

            <LanguageSwitcher />


            <AuthButton />
          </div>
        </div>
      </motion.header>

      <section
        className={`relative overflow-hidden border-b ${
          isDark
            ? "border-emerald-950/80 bg-[#03140c]"
            : "border-emerald-200/80 bg-[#e8f6ed]"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(180deg, #02150d 0%, #052619 52%, #07120c 100%)"
              : "linear-gradient(180deg, #edf8f1 0%, #d7eddf 54%, #f7faf7 100%)",
          }}
        />

        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.07, 1],
                  opacity: [0.65, 1, 0.65],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className="pointer-events-none absolute left-[18%] top-28 h-[500px] w-[650px] rounded-full blur-3xl"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(16,185,129,0.19), transparent 68%)"
              : "radial-gradient(circle, rgba(16,185,129,0.24), transparent 68%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8 lg:pb-28">
          <motion.nav
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-500"
          >
            <Link
              href={localePath("/")}
              className="transition hover:text-emerald-600"
            >
              {isEnglish ? "Home" : "\u062e\u0627\u0646\u0647"}
            </Link>

            <span>/</span>

            <Link
              href={localePath("/apps")}
              className="transition hover:text-emerald-600"
            >
              {isEnglish ? "Apps" : "\u0627\u067e\u200c\u0647\u0627"}
            </Link>

            <span>/</span>

            <span
              className={
                isDark ? "text-zinc-300" : "text-zinc-700"
              }
            >
              {isEnglish ? app.name : displayName(app)}
            </span>
          </motion.nav>

          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div
              initial={
                reduceMotion ? false : { opacity: 0, y: 24 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.58,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                      isDark
                        ? "border-emerald-700/30 bg-emerald-950/45 text-emerald-400"
                        : "border-emerald-200 bg-white/70 text-emerald-800"
                    }`}
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-5">
                <motion.div
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -4,
                          rotate: -3,
                          scale: 1.04,
                        }
                  }
                  className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border text-3xl font-black shadow-xl ${
                    isDark
                      ? "border-white/10 bg-white/[0.06] text-emerald-300"
                      : "border-white bg-white/80 text-emerald-800"
                  }`}
                >
                  {app.logoUrl ? (
                    <img
                      src={app.logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    fallbackIcon(app)
                  )}
                </motion.div>

                <div>
                  <h1
                    className={`text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${
                      isDark
                        ? "text-white"
                        : "text-emerald-950"
                    }`}
                  >
                    {isEnglish ? app.name : displayName(app)}
                  </h1>

                  {!isEnglish && app.nameFa && app.nameFa !== app.name && (
                    <p
                      dir="ltr"
                      className="mt-2 text-left text-sm font-bold text-zinc-500 sm:text-base"
                    >
                      {app.name}
                    </p>
                  )}
                </div>
              </div>

              <p
                className={`mt-7 max-w-2xl text-base font-medium leading-8 sm:text-lg ${
                  isDark
                    ? "text-zinc-300"
                    : "text-zinc-700"
                }`}
              >
                {app.shortDescription}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const isDetected =
                    devicePlatform === platform.slug;

                  return (
                    <span
                      key={platform.slug}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        isDetected
                          ? isDark
                            ? "border-emerald-500/60 bg-emerald-950/60 text-emerald-300"
                            : "border-emerald-400 bg-emerald-100 text-emerald-900"
                          : isDark
                            ? "border-white/10 bg-white/[0.035] text-zinc-300"
                            : "border-emerald-950/10 bg-white/65 text-zinc-700"
                      }`}
                    >
                      {platform.name}
                      {isDetected ? (isEnglish ? " \u2022 Your device" : " \u2022 \u062f\u0633\u062a\u06af\u0627\u0647 \u0634\u0645\u0627") : ""}
                    </span>
                  );
                })}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                {primaryLink && (
                  <motion.div
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -3, scale: 1.02 }
                    }
                    whileTap={
                      reduceMotion
                        ? undefined
                        : { scale: 0.97 }
                    }
                  >
                    <Link
                      href={`/go/${primaryLink.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-950/20 transition hover:bg-emerald-800"
                    >
                      {primaryLink.type === "DOWNLOAD" ? (
                        <DownloadIcon />
                      ) : (
                        <ExternalIcon />
                      )}

                      {primaryButtonLabel}
                    </Link>
                  </motion.div>
                )}

                {app.repositoryUrl && (
                  <motion.a
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -3, scale: 1.02 }
                    }
                    whileTap={
                      reduceMotion
                        ? undefined
                        : { scale: 0.97 }
                    }
                    href={app.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-black transition ${
                      isDark
                        ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                        : "border-emerald-950/10 bg-white/75 text-zinc-700 hover:bg-white"
                    }`}
                  >
                    {isEnglish
                      ? "Project repository"
                      : "\u0645\u062e\u0632\u0646 \u067e\u0631\u0648\u0698\u0647"}
                    <ExternalIcon />
                  </motion.a>
                )}
              </div>

              {devicePlatform && (
                <div
                  className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
                    deviceDownloadLink
                      ? isDark
                        ? "border-emerald-700/30 bg-emerald-950/35 text-emerald-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : isDark
                        ? "border-white/10 bg-white/[0.03] text-zinc-400"
                        : "border-zinc-200 bg-white/70 text-zinc-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      deviceDownloadLink
                        ? "bg-emerald-500"
                        : "bg-zinc-400"
                    }`}
                  />

                  {deviceDownloadLink && detectedPlatformName
                    ? isEnglish
                      ? `The best download for ${detectedPlatformName} was selected automatically.`
                      : `\u0644\u06cc\u0646\u06a9 \u0645\u0646\u0627\u0633\u0628 ${detectedPlatformName} \u0628\u0647\u200c\u0635\u0648\u0631\u062a \u062e\u0648\u062f\u06a9\u0627\u0631 \u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u062f.`
                    : detectedPlatformName
                      ? isEnglish
                        ? `No separate direct link is registered for ${detectedPlatformName}; the default link is shown.`
                        : `\u0628\u0631\u0627\u06cc ${detectedPlatformName} \u0644\u06cc\u0646\u06a9 \u0645\u0633\u062a\u0642\u06cc\u0645 \u062c\u062f\u0627\u06af\u0627\u0646\u0647\u200c\u0627\u06cc \u062b\u0628\u062a \u0646\u0634\u062f\u0647\u061b \u0644\u06cc\u0646\u06a9 \u067e\u06cc\u0634\u200c\u0641\u0631\u0636 \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f.`
                      : isEnglish
                        ? "A suitable device link is selected automatically when available."
                        : "\u0644\u06cc\u0646\u06a9 \u0645\u0646\u0627\u0633\u0628 \u062f\u0633\u062a\u06af\u0627\u0647 \u062f\u0631 \u0635\u0648\u0631\u062a \u0648\u062c\u0648\u062f \u0628\u0647\u200c\u0635\u0648\u0631\u062a \u062e\u0648\u062f\u06a9\u0627\u0631 \u0627\u0646\u062a\u062e\u0627\u0628 \u0645\u06cc\u200c\u0634\u0648\u062f."}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 30,
                      scale: 0.96,
                    }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative mx-auto w-full max-w-2xl [perspective:1400px]"
            >
              <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-emerald-500/10 blur-3xl" />

              {selectedScreenshot ? (
                <motion.div
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          rotateX: -2.5,
                          rotateY: 4,
                          y: -8,
                          scale: 1.01,
                        }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 24,
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`relative overflow-hidden rounded-[2rem] border p-3 shadow-[0_35px_90px_-40px_rgba(0,0,0,0.65)] ${
                    isDark
                      ? "border-white/10 bg-white/[0.055]"
                      : "border-white bg-white/80"
                  }`}
                >
                  <div
                    className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 ${
                      isDark
                        ? "bg-black/20"
                        : "bg-zinc-100/90"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                    <span className="mr-2 truncate text-[11px] font-bold text-zinc-500">
                      {selectedScreenshot.label}
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-[1.35rem] bg-black">
                    <img
                      src={selectedScreenshot.url}
                      alt={selectedScreenshot.alt}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          rotateX: -2.5,
                          rotateY: 4,
                          y: -8,
                        }
                  }
                  className={`relative flex aspect-[16/10] items-center justify-center rounded-[2rem] border p-8 text-center shadow-[0_35px_90px_-40px_rgba(0,0,0,0.65)] ${
                    isDark
                      ? "border-white/10 bg-white/[0.05]"
                      : "border-white bg-white/75"
                  }`}
                >
                  <div>
                    <span className="text-6xl font-black text-emerald-600">
                      {fallbackIcon(app)}
                    </span>

                    <p className="mt-5 font-black">
                      {isEnglish
                        ? "Screenshots for this app will be added soon"
                        : "\u062a\u0635\u0627\u0648\u06cc\u0631 \u0627\u06cc\u0646 \u0627\u067e \u0628\u0647\u200c\u0632\u0648\u062f\u06cc \u0627\u0636\u0627\u0641\u0647 \u0645\u06cc\u200c\u0634\u0648\u0646\u062f"}
                    </p>
                  </div>
                </motion.div>
              )}

              {screenshots.length > 1 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {screenshots.map((screenshot, index) => (
                    <motion.button
                      key={screenshot.url}
                      type="button"
                      onClick={() =>
                        setActiveScreenshot(index)
                      }
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { y: -3, scale: 1.02 }
                      }
                      whileTap={
                        reduceMotion
                          ? undefined
                          : { scale: 0.97 }
                      }
                      className={`overflow-hidden rounded-2xl border p-1.5 transition ${
                        activeScreenshot === index
                          ? "border-emerald-500 bg-emerald-500/10"
                          : isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-white bg-white/60"
                      }`}
                    >
                      <img
                        src={screenshot.url}
                        alt=""
                        className="aspect-[16/10] w-full rounded-xl object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <motion.section
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: 22 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`rounded-[2rem] border p-6 sm:p-8 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <span className="text-sm font-bold text-emerald-600">
                  {isEnglish
                    ? "Overview"
                    : "\u0645\u0639\u0631\u0641\u06cc \u06a9\u0627\u0645\u0644"}
                </span>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  {isEnglish
                    ? `About ${app.name}`
                    : `\u062f\u0631\u0628\u0627\u0631\u0647 ${displayName(app)}`}
                </h2>

                <div
                  className={`mt-6 space-y-5 text-[15px] font-medium leading-9 ${
                    isDark
                      ? "text-zinc-300"
                      : "text-zinc-700"
                  }`}
                >
                  {descriptionParagraphs.map(
                    (paragraph, index) => (
                      <p
                        key={`${paragraph.slice(0, 30)}-${index}`}
                      >
                        {paragraph}
                      </p>
                    ),
                  )}
                </div>

              </motion.section>

              {highlights.length > 0 && (
                <section>
                  <div className="mb-7">
                    <span className="text-sm font-bold text-emerald-600">
                      {isEnglish
                        ? "Key features"
                        : "\u0648\u06cc\u0698\u06af\u06cc\u200c\u0647\u0627\u06cc \u0645\u0647\u0645"}
                    </span>

                    <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                      {isEnglish
                        ? "Why is this app useful?"
                        : "\u0686\u0631\u0627 \u0627\u06cc\u0646 \u0627\u067e \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc \u0627\u0633\u062a\u061f"}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {highlights.map((item, index) => (
                      <motion.article
                        key={item.title}
                        initial={
                          reduceMotion
                            ? false
                            : {
                                opacity: 0,
                                y: 18,
                                scale: 0.985,
                              }
                        }
                        whileInView={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.25,
                        }}
                        transition={{
                          delay: index * 0.05,
                        }}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                                y: -6,
                                rotateX: 1,
                                rotateY: -1,
                              }
                        }
                        className={`rounded-3xl border p-5 ${
                          isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-zinc-200 bg-white shadow-sm"
                        }`}
                      >
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black ${
                            isDark
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <h3 className="mt-5 text-lg font-black">
                          {item.title}
                        </h3>

                        <p
                          className={`mt-3 text-sm leading-7 ${
                            isDark
                              ? "text-zinc-400"
                              : "text-zinc-600"
                          }`}
                        >
                          {item.description}
                        </p>
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}

              {screenshots.length > 0 && (
                <section>
                  <div className="mb-7">
                    <span className="text-sm font-bold text-emerald-600">
                      {isEnglish
                        ? "Gallery"
                        : "\u06af\u0627\u0644\u0631\u06cc"}
                    </span>

                    <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                      {isEnglish
                        ? `Screenshots of ${app.name}`
                        : `\u062a\u0635\u0627\u0648\u06cc\u0631 ${displayName(app)}`}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      {isEnglish
                        ? "A few views of the app interface and experience."
                        : "\u0686\u0646\u062f \u0646\u0645\u0627 \u0627\u0632 \u0631\u0627\u0628\u0637 \u06a9\u0627\u0631\u0628\u0631\u06cc \u0648 \u0627\u062c\u0631\u0627\u06cc \u0628\u0631\u0646\u0627\u0645\u0647."}
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {screenshots.map(
                      (screenshot, index) => (
                        <motion.button
                          key={screenshot.url}
                          type="button"
                          onClick={() => {
                            setActiveScreenshot(index);
                            window.scrollTo({
                              top: 100,
                              behavior: reduceMotion
                                ? "auto"
                                : "smooth",
                            });
                          }}
                          whileHover={
                            reduceMotion
                              ? undefined
                              : {
                                  y: -7,
                                  scale: 1.01,
                                  rotateX: 1.2,
                                }
                          }
                          className={`group overflow-hidden rounded-[1.75rem] border p-2 text-right ${
                            isDark
                              ? "border-white/10 bg-white/[0.03]"
                              : "border-zinc-200 bg-white"
                          }`}
                        >
                          <div className="overflow-hidden rounded-[1.3rem]">
                            <img
                              src={screenshot.url}
                              alt={screenshot.alt}
                              className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                            />
                          </div>

                          <p className="px-3 pb-2 pt-4 text-sm font-black">
                            {screenshot.label}
                          </p>
                        </motion.button>
                      ),
                    )}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <motion.section
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: -16 }
                }
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`rounded-[1.75rem] border p-6 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <h2 className="text-lg font-black">
                  {isEnglish
                    ? "App information"
                    : "\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0627\u067e"}
                </h2>

                <dl className="mt-5 space-y-5 text-sm">
                  {app.developerName && (
                    <div>
                      <dt className="text-zinc-500">
                        {isEnglish
                          ? "Developer"
                          : "\u062a\u0648\u0633\u0639\u0647\u200c\u062f\u0647\u0646\u062f\u0647"}
                      </dt>
                      <dd className="mt-1 font-black">
                        {app.developerName}
                      </dd>
                    </div>
                  )}

                  {app.licenseName && (
                    <div>
                      <dt className="text-zinc-500">
                        {isEnglish
                          ? "License"
                          : "\u0645\u062c\u0648\u0632"}
                      </dt>
                      <dd
                        dir="ltr"
                        className="mt-1 text-right font-black"
                      >
                        {app.licenseName}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-zinc-500">
                      {isEnglish
                        ? "Platforms"
                        : "\u067e\u0644\u062a\u0641\u0631\u0645\u200c\u0647\u0627"}
                    </dt>

                    <dd className="mt-2 flex flex-wrap gap-2">
                      {platforms.map((platform) => (
                        <span
                          key={platform.slug}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                            devicePlatform === platform.slug
                              ? isDark
                                ? "bg-emerald-950 text-emerald-300 ring-1 ring-emerald-700/50"
                                : "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300"
                              : isDark
                                ? "bg-white/5 text-zinc-300"
                                : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {platform.name}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </motion.section>

              <section
                className={`rounded-[1.75rem] border p-6 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <h2 className="text-lg font-black">
                  {isEnglish
                    ? "Official links"
                    : "\u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u0631\u0633\u0645\u06cc"}
                </h2>

                <div className="mt-4 space-y-3">
                  {displayedLinks.map((link) => {
                    const isRecommended =
                      deviceDownloadLink?.id === link.id;

                    return (
                      <motion.div
                        key={link.id}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : { x: -3, y: -2 }
                        }
                      >
                        <Link
                          href={`/go/${link.id}`}
                          className={`group flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition ${
                            isRecommended
                              ? isDark
                                ? "border-emerald-600/60 bg-emerald-950/35"
                                : "border-emerald-300 bg-emerald-50"
                              : isDark
                                ? "border-white/10 bg-white/[0.025] hover:border-emerald-700/50"
                                : "border-zinc-200 bg-zinc-50 hover:border-emerald-300 hover:bg-emerald-50"
                          }`}
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black">
                                {link.label}
                              </p>

                              {isRecommended && (
                                <span
                                  className={`rounded-full px-2 py-1 text-[10px] font-black ${
                                    isDark
                                      ? "bg-emerald-500/15 text-emerald-300"
                                      : "bg-emerald-200/70 text-emerald-900"
                                  }`}
                                >
                                  {isEnglish
                                    ? "Recommended for your device"
                                    : "\u0645\u0646\u0627\u0633\u0628 \u062f\u0633\u062a\u06af\u0627\u0647 \u0634\u0645\u0627"}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-zinc-500">
                              {formatLinkType(link.type, locale)}
                              {link.platformName
                                ? ` · ${link.platformName}`
                                : ""}
                            </p>
                          </div>

                          <span className="text-emerald-600 transition group-hover:-translate-x-1">
                            {isEnglish ? "\u2192" : "\u2190"}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              <div
                className={`rounded-2xl border p-4 text-sm font-medium leading-7 ${
                  isDark
                    ? "border-amber-800/20 bg-amber-950/15 text-amber-100/70"
                    : "border-amber-200 bg-amber-50 text-amber-950/75"
                }`}
              >
                {isEnglish
                  ? "AppKhor does not host this app's installer. Download links take you directly to the project's official source."
                  : "\u0627\u067e\u200c\u062e\u0648\u0631 \u0641\u0627\u06cc\u0644 \u0646\u0635\u0628 \u0627\u06cc\u0646 \u0628\u0631\u0646\u0627\u0645\u0647 \u0631\u0627 \u0645\u06cc\u0632\u0628\u0627\u0646\u06cc \u0646\u0645\u06cc\u200c\u06a9\u0646\u062f. \u0644\u06cc\u0646\u06a9\u200c\u0647\u0627\u06cc \u062f\u0631\u06cc\u0627\u0641\u062a \u0634\u0645\u0627 \u0631\u0627 \u0628\u0647 \u0645\u0646\u0628\u0639 \u0631\u0633\u0645\u06cc \u067e\u0631\u0648\u0698\u0647 \u0647\u062f\u0627\u06cc\u062a \u0645\u06cc\u200c\u06a9\u0646\u0646\u062f."}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {relatedApps.length > 0 && (
        <section
          className={`border-y ${
            isDark
              ? "border-white/10 bg-[#091810]"
              : "border-zinc-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-5">
              <div>
                <span className="text-sm font-bold text-emerald-600">
                  {isEnglish
                    ? "Explore next"
                    : "\u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u0628\u0639\u062f\u06cc"}
                </span>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  {isEnglish
                    ? "Similar apps"
                    : "\u0627\u067e\u200c\u0647\u0627\u06cc \u0645\u0634\u0627\u0628\u0647"}
                </h2>
              </div>

              <Link
                href={localePath("/apps")}
                className="hidden items-center gap-2 text-sm font-bold text-emerald-600 sm:flex"
              >
                {isEnglish
                  ? "All apps"
                  : "\u0647\u0645\u0647 \u0627\u067e\u200c\u0647\u0627"}
                <ArrowIcon />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedApps.map((related) => (
                <motion.article
                  key={related.id}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -7, scale: 1.01 }
                  }
                  className={`rounded-3xl border p-5 ${
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-zinc-200 bg-[#fbfdfb]"
                  }`}
                >
                  <Link
                    href={`${localePath("/apps")}/${related.slug}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-xl font-black ${
                          isDark
                            ? "bg-emerald-950"
                            : "bg-emerald-50"
                        }`}
                      >
                        {related.logoUrl ? (
                          <img
                            src={related.logoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          fallbackIcon(related)
                        )}
                      </span>

                      <div>
                        <span className="text-xs font-bold text-emerald-600">
                          {related.category ?? (isEnglish ? "Similar app" : "\u0627\u067e \u0645\u0634\u0627\u0628\u0647")}
                        </span>

                        <h3 className="mt-1 font-black">
                          {isEnglish ? related.name : displayName(related)}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-7 text-zinc-500">
                      {related.description}
                    </p>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer
        className={`border-t ${
          isDark
            ? "border-white/10 bg-[#07120c]"
            : "border-zinc-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 font-black text-white">
              {isEnglish ? "A" : "\u0627"}
            </span>

            <strong
              className={
                isDark ? "text-zinc-300" : "text-zinc-700"
              }
            >
              {isEnglish
                ? "AppKhor"
                : "\u0627\u067e\u200c\u062e\u0648\u0631"}
            </strong>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link href={localePath("/")}>
              {isEnglish ? "Home" : "\u062e\u0627\u0646\u0647"}
            </Link>

            <Link href={localePath("/categories")}>
              {isEnglish
                ? "Categories"
                : "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
            </Link>

            <Link href={localePath("/apps")}>
              {isEnglish
                ? "All apps"
                : "\u0647\u0645\u0647 \u0627\u067e\u200c\u0647\u0627"}
            </Link>

            <Link href={localePath("/apps")}>
              {isEnglish
                ? "Search"
                : "\u062c\u0633\u062a\u200c\u0648\u062c\u0648"}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
