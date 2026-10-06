"use client";

import { type FormEvent, type MouseEvent, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import SiteSearchButton from "@/components/site-search-button";

import AuthButton from "@/components/auth/auth-button";
import LanguageSwitcher from "@/components/language-switcher";
import { useAppTheme } from "@/components/app-theme-provider";
import type {
  HomeApp,
  HomeCategory,
  HomeStats,
} from "./page";

type HomeClientProps = {
  latestApps: HomeApp[];
  popularApps: HomeApp[];
  categories: HomeCategory[];
  stats: HomeStats;
  locale?: "fa" | "en";
};

const categoryEmoji: Record<string, string> = {
  productivity: "\u26A1",
  development: "\u{1F4BB}",
  "internet-network": "\u{1F310}",
  "security-privacy": "\u{1F6E1}\uFE0F",
  multimedia: "\u{1F3AC}",
  "design-creative": "\u{1F3A8}",
  "file-management": "\u{1F4C1}",
  "system-tools": "\u2699\uFE0F",
  communication: "\u{1F4AC}",
  education: "\u{1F393}",
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
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

function displayName(app: HomeApp) {
  return app.nameFa || app.name;
}

function fallbackAppIcon(app: HomeApp) {
  return displayName(app).trim().slice(0, 1).toUpperCase() || "\u0627";
}

function faNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function HomeClient({
  latestApps,
  popularApps,
  categories,
  stats,
  locale = "fa",
}: HomeClientProps) {
  const { isDark, mounted, toggleTheme } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const isEnglish = locale === "en";
  const localizedNumber = (value: number) =>
    value.toLocaleString(isEnglish ? "en-US" : "fa-IR");
  const localePath = (path: string) =>
    isEnglish ? `/en${path === "/" ? "" : path}` : path;
  const [search, setSearch] = useState("");

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);

    if (!element) {
      return;
    }

    const headerOffset = 96;

    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;

    const targetPosition =
      elementPosition - headerOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: reduceMotion ? "auto" : "smooth",
    });

    window.history.replaceState(
      null,
      "",
      `#${sectionId}`,
    );
  }

  function handleSectionClick(
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) {
    event.preventDefault();
    scrollToSection(sectionId);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push(localePath("/apps"));
      return;
    }

    router.push(`${localePath("/apps")}?q=${encodeURIComponent(query)}`);
  }

  return (
    <main
      dir={locale === "en" ? "ltr" : "rtl"}
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-[#07120c] text-zinc-100"
          : "bg-[#f7faf7] text-[#17211a]"
      }`}
    >
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? "border-white/10 bg-[#07120c]/90"
            : "border-emerald-950/10 bg-white/90"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href={localePath("/")} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-black text-white shadow-lg shadow-emerald-900/20">
              {isEnglish ? "A" : "\u0627"}
            </span>

            <div>
              <strong className="block text-xl font-black">
                {isEnglish ? "AppKhor" : "\u0627\u067e\u200c\u062e\u0648\u0631"}
              </strong>

              <span
                className={`text-xs ${
                  isDark
                    ? "text-zinc-400"
                    : "text-zinc-500"
                }`}
              >
                {isEnglish
                  ? "Useful apps, all in one place"
                  : "\u0627\u067e\u200c\u0647\u0627\u06cc \u0645\u0641\u06cc\u062f\u060c \u06cc\u06a9\u200c\u062c\u0627"}
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
              href={localePath("/")}
              className="text-emerald-500"
            >
              {isEnglish ? "Home" : "\u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc"}
            </Link>

            <Link
              href={localePath("/categories")}
              className="transition hover:text-emerald-500"
            >
              {isEnglish ? "Categories" : "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
            </Link>

            <Link
              href={localePath("/apps")}
              className="transition hover:text-emerald-500"
            >
              {isEnglish ? "All apps" : "\u0647\u0645\u0647 \u0627\u067e\u200c\u0647\u0627"}
            </Link>

            <a
              href="#about"
              onClick={(event) =>
                handleSectionClick(event, "about")
              }
              className="transition hover:text-emerald-500"
            >
              {isEnglish ? "About" : "\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627"}
            </a>
          </nav>
<SiteSearchButton />

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      scale: 1.08,
                      rotate: isDark ? -8 : 8,
                    }
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
              {mounted
                ? isDark
                  ? "\u2600\uFE0F"
                  : "\u{1F319}"
                : "\u{1F319}"}
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
            ? "border-white/10 bg-[#091810]"
            : "border-emerald-950/10 bg-white"
        }`}
      >
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-lime-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                isDark
                  ? "border-emerald-700/40 bg-emerald-950/60 text-emerald-400"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {isEnglish
                ? "A curated collection of useful open-source apps"
                : "\u0645\u062c\u0645\u0648\u0639\u0647\u200c\u0627\u06cc \u0627\u0632 \u0627\u067e\u200c\u0647\u0627\u06cc \u0645\u062a\u0646\u200c\u0628\u0627\u0632 \u06a9\u0627\u0631\u0628\u0631\u062f\u06cc"}
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.35] tracking-tight sm:text-5xl lg:text-6xl">
              {isEnglish ? (
                <>
                  Discover useful apps,
                  <span className="text-emerald-600">
                    {" "}
                    review them{" "}
                  </span>
                  and get them from official sources
                </>
              ) : (
                <>
                  {"\u0627\u067e\u200c\u0647\u0627\u06cc \u0645\u0641\u06cc\u062f \u0631\u0627"}
                  <span className="text-emerald-600">
                    {" "}
                    {"\u067e\u06cc\u062f\u0627 \u06a9\u0646\u060c \u0628\u0631\u0631\u0633\u06cc \u06a9\u0646"}{" "}
                  </span>
                  {"\u0648 \u0627\u0632 \u0645\u0646\u0628\u0639 \u0631\u0633\u0645\u06cc \u0628\u06af\u06cc\u0631"}
                </>
              )}
            </h1>

            <p
              className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${
                isDark
                  ? "text-zinc-400"
                  : "text-zinc-600"
              }`}
            >
              {isEnglish
                ? "AppKhor helps you discover useful apps and open-source projects quickly, with direct access to each project's official sources."
                : "\u0627\u067e\u200c\u062e\u0648\u0631 \u06cc\u06a9 \u0645\u0631\u062c\u0639 \u0641\u0627\u0631\u0633\u06cc \u0628\u0631\u0627\u06cc \u067e\u06cc\u062f\u0627 \u06a9\u0631\u062f\u0646 \u0648 \u0645\u0639\u0631\u0641\u06cc \u0627\u067e\u200c\u0647\u0627 \u0648 \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627\u06cc \u0645\u062a\u0646\u200c\u0628\u0627\u0632 \u0627\u0633\u062a\u061b \u0633\u0627\u062f\u0647\u060c \u0633\u0631\u06cc\u0639 \u0648 \u0645\u062a\u0635\u0644 \u0628\u0647 \u0645\u0646\u0628\u0639 \u0631\u0633\u0645\u06cc \u0647\u0631 \u067e\u0631\u0648\u0698\u0647."}
            </p>

            <form
              onSubmit={handleSearch}
              className={`mt-9 max-w-2xl rounded-2xl border p-2 shadow-2xl ${
                isDark
                  ? "border-white/10 bg-white/5 shadow-black/20"
                  : "border-zinc-200 bg-white shadow-emerald-900/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`mr-3 ${
                    isDark
                      ? "text-zinc-500"
                      : "text-zinc-400"
                  }`}
                >
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    isEnglish
                      ? "Search for an app or tool..."
                      : "\u0646\u0627\u0645 \u0627\u067e \u06cc\u0627 \u0627\u0628\u0632\u0627\u0631 \u0645\u0648\u0631\u062f\u0646\u0638\u0631\u062a \u0631\u0627 \u062c\u0633\u062a\u200c\u0648\u062c\u0648 \u06a9\u0646..."
                  }
                  className={`min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none sm:text-base ${
                    isDark
                      ? "text-white placeholder:text-zinc-600"
                      : "text-zinc-900 placeholder:text-zinc-400"
                  }`}
                />

                <motion.button
                  type="submit"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -2, scale: 1.025 }
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
                  className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                >
                  {isEnglish ? "Search" : "\u062c\u0633\u062a\u200c\u0648\u062c\u0648"}
                </motion.button>
              </div>
            </form>

            <div
              className={`mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm ${
                isDark
                  ? "text-zinc-400"
                  : "text-zinc-600"
              }`}
            >
              <div>
                <strong
                  className={`${isEnglish ? "mr-1" : "ml-1"} text-xl font-black ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {localizedNumber(stats.publishedApps)}
                </strong>
                {isEnglish
                  ? "published apps"
                  : "\u0627\u067e \u0645\u0646\u062a\u0634\u0631\u0634\u062f\u0647"}
              </div>

              <div>
                <strong
                  className={`${isEnglish ? "mr-1" : "ml-1"} text-xl font-black ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {localizedNumber(stats.outboundClicks)}
                </strong>
                {isEnglish
                  ? "official-source visits"
                  : "\u0645\u0631\u0627\u062c\u0639\u0647 \u0628\u0647 \u0645\u0646\u0627\u0628\u0639 \u0631\u0633\u0645\u06cc"}
              </div>

              <div>
                <strong
                  className={`${isEnglish ? "mr-1" : "ml-1"} text-xl font-black ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {localizedNumber(stats.activeCategories)}
                </strong>
                {isEnglish
                  ? "active categories"
                  : "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc \u0641\u0639\u0627\u0644"}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 28, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.65,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={
              reduceMotion ? undefined : { y: -5 }
            }
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute -inset-5 rounded-[2.5rem] bg-emerald-500/10 blur-2xl" />

            <div
              className={`relative rounded-[2rem] border p-5 shadow-2xl ${
                isDark
                  ? "border-white/10 bg-[#0d2116] shadow-black/30"
                  : "border-emerald-100 bg-white shadow-emerald-900/10"
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-500">
                    {isEnglish
                      ? "AppKhor picks"
                      : "\u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u0627\u067e\u200c\u062e\u0648\u0631"}
                  </span>

                  <h2 className="mt-1 text-xl font-black">
                    {isEnglish
                      ? "Popular in the last 7 days"
                      : "\u0645\u062d\u0628\u0648\u0628\u200c\u0647\u0627\u06cc \u06f7 \u0631\u0648\u0632 \u0627\u062e\u06cc\u0631"}
                  </h2>
                </div>

                <span
                  className={`rounded-xl px-3 py-2 text-xs font-bold ${
                    isDark
                      ? "bg-emerald-950 text-emerald-400"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {isEnglish
                    ? "Live"
                    : "\u0632\u0646\u062f\u0647"}
                </span>
              </div>

              <div className="space-y-3">
                {popularApps.length > 0 ? (
                  popularApps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, x: 18 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3 + index * 0.08,
                      }}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { x: -4, scale: 1.01 }
                      }
                    >
                      <Link
                        href={`${localePath("/apps")}/${app.slug}`}
                        className={`flex items-center gap-4 rounded-2xl border p-4 ${
                          isDark
                            ? "border-white/5 bg-white/[0.03]"
                            : "border-zinc-100 bg-[#fbfdfb]"
                        }`}
                      >
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xl font-black ${
                            isDark
                              ? "bg-emerald-950"
                              : "bg-emerald-100"
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

                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">
                            {displayName(app)}
                          </strong>

                          <span className="mt-1 block text-xs text-zinc-500">
                            {localizedNumber(app.clickCount)}{" "}
                            {isEnglish
                              ? "visits this week"
                              : "\u0645\u0631\u0627\u062c\u0639\u0647 \u0627\u06cc\u0646 \u0647\u0641\u062a\u0647"}
                          </span>
                        </div>

                        <span className="text-sm font-black text-emerald-500">
                          {localizedNumber(index + 1)}
                        </span>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
                    {isEnglish
                      ? "Not enough data for popular apps yet."
                      : "\u0647\u0646\u0648\u0632 \u062f\u0627\u062f\u0647 \u06a9\u0627\u0641\u06cc \u0628\u0631\u0627\u06cc \u0645\u062d\u0628\u0648\u0628\u200c\u062a\u0631\u06cc\u0646\u200c\u0647\u0627 \u0646\u062f\u0627\u0631\u06cc\u0645."}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="categories"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-bold text-emerald-600">
              {isEnglish
                ? "Quick access"
                : "\u062f\u0633\u062a\u0631\u0633\u06cc \u0633\u0631\u06cc\u0639"}
            </span>

            <h2 className="mt-2 text-3xl font-black">
              {isEnglish
                ? "App categories"
                : "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc \u0627\u067e\u200c\u0647\u0627"}
            </h2>
          </div>

          <Link
            href={localePath("/categories")}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600"
          >
            {isEnglish
              ? "View all categories"
              : "\u0645\u0634\u0627\u0647\u062f\u0647 \u0647\u0645\u0647 \u062f\u0633\u062a\u0647\u200c\u0647\u0627"}
            <ArrowIcon />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={
                reduceMotion ? false : { opacity: 0, y: 18 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -7, scale: 1.02 }
              }
              whileTap={
                reduceMotion
                  ? undefined
                  : { scale: 0.985 }
              }
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
              }}
            >
              <Link
                href={localePath("/categories")}
                className={`group block rounded-2xl border p-5 transition ${
                  isDark
                    ? "border-white/10 bg-white/[0.03] hover:border-emerald-700"
                    : "border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
                      isDark
                        ? "bg-emerald-950"
                        : "bg-emerald-50"
                    }`}
                  >
                    {categoryEmoji[category.slug] ?? "\u25C8"}
                  </span>

                  <span
                    className={`transition group-hover:text-emerald-500 ${
                      isDark
                        ? "text-zinc-700"
                        : "text-zinc-300"
                    }`}
                  >
                    <ArrowIcon />
                  </span>
                </div>

                <h3 className="mt-6 font-black">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  {localizedNumber(category.appCount)}{" "}
                  {isEnglish ? "apps" : "\u0627\u067e"}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="apps"
        className={`border-y ${
          isDark
            ? "border-white/10 bg-[#091810]"
            : "border-zinc-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-sm font-bold text-emerald-600">
                {isEnglish
                  ? "Fresh on AppKhor"
                  : "\u062a\u0627\u0632\u0647\u200c\u0647\u0627\u06cc \u0627\u067e\u200c\u062e\u0648\u0631"}
              </span>

              <h2 className="mt-2 text-3xl font-black">
                {isEnglish
                  ? "Latest apps"
                  : "\u062c\u062f\u06cc\u062f\u062a\u0631\u06cc\u0646 \u0627\u067e\u0644\u06cc\u06a9\u06cc\u0634\u0646\u200c\u0647\u0627"}
              </h2>
            </div>

            <Link
              href={localePath("/apps")}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600"
            >
              {isEnglish
                ? "View all apps"
                : "\u0645\u0634\u0627\u0647\u062f\u0647 \u0647\u0645\u0647 \u0627\u067e\u200c\u0647\u0627"}
              <ArrowIcon />
            </Link>
          </div>

          {latestApps.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {latestApps.map((app) => (
                <motion.article
                  key={app.id}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 26, scale: 0.98 }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -8, scale: 1.015 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 230,
                    damping: 22,
                  }}
                  className={`group overflow-hidden rounded-3xl border transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/[0.03] hover:border-emerald-700"
                      : "border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-xl"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-3xl font-black ${
                          isDark
                            ? "bg-emerald-950"
                            : "bg-emerald-50"
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

                      {app.featured && (
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            isDark
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isEnglish
                            ? "Featured"
                            : "\u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u0648\u06cc\u0698\u0647"}
                        </span>
                      )}
                    </div>

                    <span className="mt-6 block text-xs font-bold text-emerald-600">
                      {app.category ??
                        (isEnglish
                          ? "Uncategorized"
                          : "\u0628\u062f\u0648\u0646 \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc")}
                    </span>

                    <h3 className="mt-2 text-xl font-black">
                      {displayName(app)}
                    </h3>

                    <p
                      className={`mt-3 min-h-16 text-sm leading-7 ${
                        isDark
                          ? "text-zinc-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {app.description}
                    </p>

                    <div
                      className={`mt-6 grid grid-cols-3 divide-x divide-x-reverse rounded-2xl py-3 text-center ${
                        isDark
                          ? "divide-white/10 bg-white/[0.04]"
                          : "divide-zinc-200 bg-zinc-50"
                      }`}
                    >
                      <div>
                        <span className="block text-xs text-zinc-500">
                          {isEnglish
                            ? "Visits"
                            : "\u0645\u0631\u0627\u062c\u0639\u0647"}
                        </span>

                        <strong className="mt-1 block text-xs">
                          {localizedNumber(app.clickCount)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 border-t p-4 ${
                      isDark
                        ? "border-white/10"
                        : "border-zinc-100"
                    }`}
                  >
                    <motion.div
                      className="flex-1"
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { y: -2, scale: 1.015 }
                      }
                      whileTap={
                        reduceMotion
                          ? undefined
                          : { scale: 0.97 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 24,
                      }}
                    >
                      <Link
                        href={`${localePath("/apps")}/${app.slug}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800"
                      >
                        {isEnglish
                          ? "View app"
                          : "\u0645\u0634\u0627\u0647\u062f\u0647 \u0627\u067e"}
                        <DownloadIcon />
                      </Link>
                    </motion.div>

                    <motion.div
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { rotate: -8, scale: 1.08 }
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
                    >
                      <Link
                        href={`${localePath("/apps")}/${app.slug}`}
                        aria-label={isEnglish ? `View ${displayName(app)}` : `\u0645\u0634\u0627\u0647\u062f\u0647 ${displayName(app)}`}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition hover:border-emerald-500 hover:text-emerald-500 ${
                          isDark
                            ? "border-white/10 text-zinc-400"
                            : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        <ArrowIcon />
                      </Link>
                    </motion.div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div
              className={`rounded-3xl border p-10 text-center ${
                isDark
                  ? "border-white/10 bg-white/[0.03] text-zinc-400"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {isEnglish
                ? "No published apps yet."
                : "\u0647\u0646\u0648\u0632 \u0627\u067e \u0645\u0646\u062a\u0634\u0631\u0634\u062f\u0647\u200c\u0627\u06cc \u0648\u062c\u0648\u062f \u0646\u062f\u0627\u0631\u062f."}
            </div>
          )}
        </div>
      </section>

      <section
        id="about"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
      >
        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 28, scale: 0.985 }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          whileHover={
            reduceMotion
              ? undefined
              : { scale: 1.006 }
          }
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-[2rem] bg-[#123c28] px-7 py-12 text-white shadow-2xl shadow-emerald-950/20 md:px-12"
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-28 right-12 h-64 w-64 rounded-full bg-emerald-500/10" />

          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="text-sm font-bold text-emerald-300">
                {isEnglish
                  ? "Support AppKhor"
                  : "\u0647\u0645\u0631\u0627\u0647 \u0627\u067e\u200c\u062e\u0648\u0631 \u0628\u0627\u0634"}
              </span>

              <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
                {isEnglish
                  ? "Your support helps AppKhor grow and feature more useful projects"
                  : "\u062d\u0645\u0627\u06cc\u062a \u062a\u0648 \u0628\u0627\u0639\u062b \u0628\u0647\u062a\u0631\u0634\u062f\u0646 \u0627\u067e\u200c\u062e\u0648\u0631 \u0648 \u0627\u0636\u0627\u0641\u0647\u200c\u0634\u062f\u0646 \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627\u06cc \u0645\u0641\u06cc\u062f \u0628\u06cc\u0634\u062a\u0631 \u0645\u06cc\u200c\u0634\u0648\u062f"}
              </h2>

              <p className="mt-5 leading-8 text-emerald-50/75">
                {isEnglish
                  ? "If AppKhor has been useful to you, a small contribution can help us keep developing the site and introduce more open-source projects."
                  : "\u0627\u06af\u0631 \u0627\u067e\u200c\u062e\u0648\u0631 \u0628\u0631\u0627\u06cc\u062a \u0645\u0641\u06cc\u062f \u0628\u0648\u062f\u0647\u060c \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc \u0628\u0627 \u06cc\u06a9 \u062d\u0645\u0627\u06cc\u062a \u06a9\u0648\u0686\u06a9 \u0628\u0647 \u0627\u062f\u0627\u0645\u0647 \u062a\u0648\u0633\u0639\u0647 \u0633\u0627\u06cc\u062a \u0648 \u0645\u0639\u0631\u0641\u06cc \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627\u06cc \u0645\u062a\u0646\u200c\u0628\u0627\u0632 \u0628\u06cc\u0634\u062a\u0631 \u06a9\u0645\u06a9 \u06a9\u0646\u06cc."}
              </p>
            </div>

            <motion.a
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -3, scale: 1.03 }
              }
              whileTap={
                reduceMotion
                  ? undefined
                  : { scale: 0.97 }
              }
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 22,
              }}
              href="https://reymit.ir/saeid_bjn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-black text-emerald-900 transition-colors hover:bg-emerald-50"
            >
              {isEnglish
                ? "Support AppKhor"
                : "\u062d\u0645\u0627\u06cc\u062a \u0627\u0632 \u0627\u067e\u200c\u062e\u0648\u0631"}
              <ArrowIcon />
            </motion.a>
          </div>
        </motion.div>
      </section>

      <footer
        className={`border-t ${
          isDark
            ? "border-white/10 bg-[#07120c]"
            : "border-zinc-200 bg-white"
        }`}
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 font-black text-white">
                {isEnglish ? "A" : "\u0627"}
              </span>

              <strong className="text-xl font-black">
                {isEnglish ? "AppKhor" : "\u0627\u067e\u200c\u062e\u0648\u0631"}
              </strong>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-500">
              {isEnglish
                ? "A simple place to discover useful apps and open-source projects and reach their official sources."
                : "\u0645\u0631\u062c\u0639\u06cc \u0633\u0627\u062f\u0647 \u0648 \u0641\u0627\u0631\u0633\u06cc \u0628\u0631\u0627\u06cc \u067e\u06cc\u062f\u0627 \u06a9\u0631\u062f\u0646 \u0648 \u0645\u0639\u0631\u0641\u06cc \u0627\u067e\u200c\u0647\u0627 \u0648 \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627\u06cc \u0645\u062a\u0646\u200c\u0628\u0627\u0632 \u0648 \u0631\u0641\u062a\u0646 \u0628\u0647 \u0645\u0646\u0627\u0628\u0639 \u0631\u0633\u0645\u06cc \u0622\u0646\u200c\u0647\u0627."}
            </p>
          </div>

          <div>
            <strong className="font-black">
              {isEnglish
                ? "Quick access"
                : "\u062f\u0633\u062a\u0631\u0633\u06cc \u0633\u0631\u06cc\u0639"}
            </strong>

            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
              <Link
                href={localePath("/")}
                className="hover:text-emerald-600"
              >
                {isEnglish
                  ? "Home"
                  : "\u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc"}
              </Link>

              <Link
                href={localePath("/apps")}
                className="hover:text-emerald-600"
              >
                {isEnglish
                  ? "All apps"
                  : "\u0647\u0645\u0647 \u0627\u067e\u200c\u0647\u0627"}
              </Link>

              <Link
                href={localePath("/categories")}
                className="hover:text-emerald-600"
              >
                {isEnglish
                  ? "Categories"
                  : "\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627"}
              </Link>
            </div>
          </div>

          <div>
            <strong className="font-black">
              {isEnglish
                ? "Site"
                : "\u0645\u062f\u06cc\u0631\u06cc\u062a \u0633\u0627\u06cc\u062a"}
            </strong>

            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
              <AuthButton />

              <a
                href="https://reymit.ir/saeid_bjn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600"
              >
                {isEnglish
                  ? "Support"
                  : "\u062d\u0645\u0627\u06cc\u062a \u0645\u0627\u0644\u06cc"}
              </a>
            </div>
          </div>
        </div>

        <div
          className={`border-t ${
            isDark
              ? "border-white/10"
              : "border-zinc-100"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-zinc-500 sm:flex-row sm:justify-between lg:px-8">
            <span>
              {isEnglish
                ? "All rights reserved for AppKhor."
                : "\u062a\u0645\u0627\u0645 \u062d\u0642\u0648\u0642 \u0628\u0631\u0627\u06cc \u0627\u067e\u200c\u062e\u0648\u0631 \u0645\u062d\u0641\u0648\u0638 \u0627\u0633\u062a."}
            </span>

            <span>
              {isEnglish
                ? "Built for people who love useful software"
                : "\u0633\u0627\u062e\u062a\u0647\u200c\u0634\u062f\u0647 \u0628\u0631\u0627\u06cc \u06a9\u0627\u0631\u0628\u0631\u0627\u0646 \u0641\u0627\u0631\u0633\u06cc\u200c\u0632\u0628\u0627\u0646"}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
