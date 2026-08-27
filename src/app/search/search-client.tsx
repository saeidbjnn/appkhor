"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import AuthButton from "@/components/auth/auth-button";
import { useAppTheme } from "@/components/app-theme-provider";
import type { SearchApp } from "./page";

type SearchClientProps = {
  query: string;
  results: SearchApp[];
  similarApps: SearchApp[];
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

function displayName(app: SearchApp) {
  return app.nameFa || app.name;
}

function fallbackIcon(app: SearchApp) {
  return displayName(app).trim().slice(0, 1).toUpperCase() || "ا";
}

export default function SearchClient({
  query,
  results,
  similarApps,
}: SearchClientProps) {
  const { isDark, mounted, toggleTheme } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const [value, setValue] = useState(query);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = value.trim();

    if (!nextQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  }

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
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          isDark
            ? "border-white/10 bg-[#07120c]/90"
            : "border-emerald-950/10 bg-white/90"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-black text-white">
              ا
            </span>

            <div>
              <strong className="block text-xl font-black">اپ‌خور</strong>
              <span className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                اپ‌های مفید، یک‌جا
              </span>
            </div>
          </Link>

          <nav
            className={`hidden items-center gap-8 text-sm font-bold md:flex ${
              isDark ? "text-zinc-300" : "text-zinc-600"
            }`}
          >
            <Link href="/" className="transition hover:text-emerald-500">
              صفحه اصلی
            </Link>
            <Link href="/categories" className="transition hover:text-emerald-500">
              دسته‌بندی‌ها
            </Link>
            <Link href="/apps" className="transition hover:text-emerald-500">
              همه اپ‌ها
            </Link>
            <Link href="/search" className="text-emerald-500">
              جست‌وجو
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -2, rotate: -5, scale: 1.04 }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.92 }}
              aria-label="تغییر حالت نمایش"
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {mounted ? (isDark ? "☀️" : "🌙") : "🌙"}
            </motion.button>

            <AuthButton />
          </div>
        </div>
      </motion.header>

      <section
        className={`relative overflow-hidden border-b ${
          isDark
            ? "border-emerald-950/80 bg-[#03150d]"
            : "border-emerald-200 bg-[#e8f6ed]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.18),transparent_45%)]" />

        <div className="relative mx-auto max-w-5xl px-5 py-16 text-center lg:px-8 lg:py-20">
          <span className="text-sm font-bold text-emerald-600">
            جست‌وجوی اپ‌خور
          </span>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            چی لازم داری؟
          </h1>

          <p className={`mx-auto mt-4 max-w-2xl leading-8 ${
            isDark ? "text-zinc-400" : "text-zinc-600"
          }`}>
            اسم اپ، کاربرد، دسته‌بندی یا عبارتی مثل «ویدیو پلیر» را بنویس.
          </p>

          <form
            onSubmit={handleSearch}
            className={`mx-auto mt-8 max-w-3xl rounded-2xl border p-2 shadow-2xl ${
              isDark
                ? "border-white/10 bg-white/5 shadow-black/20"
                : "border-zinc-200 bg-white shadow-emerald-900/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`mr-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                <SearchIcon />
              </span>

              <input
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="مثلاً VLC، ویدیو پلیر، امنیت..."
                className={`min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none sm:text-base ${
                  isDark
                    ? "text-white placeholder:text-zinc-600"
                    : "text-zinc-900 placeholder:text-zinc-400"
                }`}
              />

              <motion.button
                type="submit"
                whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
              >
                جست‌وجو
              </motion.button>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        {!query ? (
          <div className={`rounded-3xl border p-10 text-center ${
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-zinc-200 bg-white"
          }`}>
            <h2 className="text-xl font-black">عبارت موردنظرت را جست‌وجو کن</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-500">
              می‌تونی اسم برنامه یا کاربردی که دنبالش هستی رو بنویسی.
            </p>
          </div>
        ) : (
          <>
            <section>
              <div className="mb-8">
                <span className="text-sm font-bold text-emerald-600">
                  نتیجه اصلی
                </span>
                <h2 className="mt-2 text-3xl font-black">
                  اپ‌های مرتبط با «{query}»
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {results.length.toLocaleString("fa-IR")} نتیجه پیدا شد
                </p>
              </div>

              {results.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {results.map((app) => (
                    <motion.article
                      key={app.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      whileHover={reduceMotion ? undefined : { y: -7, scale: 1.01 }}
                      className={`overflow-hidden rounded-3xl border ${
                        isDark
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-zinc-200 bg-white shadow-sm"
                      }`}
                    >
                      <Link href={`/apps/${app.slug}`} className="block p-6">
                        <div className="flex items-start gap-4">
                          <span className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl font-black ${
                            isDark ? "bg-emerald-950" : "bg-emerald-50"
                          }`}>
                            {app.logoUrl ? (
                              <img
                                src={app.logoUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              fallbackIcon(app)
                            )}
                          </span>

                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-600">
                              {app.category ?? "بدون دسته‌بندی"}
                            </span>
                            <h3 className="mt-1 text-xl font-black">
                              {displayName(app)}
                            </h3>
                            {app.developerName && (
                              <p className="mt-1 text-xs text-zinc-500">
                                {app.developerName}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className={`mt-5 text-sm leading-7 ${
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}>
                          {app.description}
                        </p>

                        {app.platforms.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {app.platforms.slice(0, 4).map((platform) => (
                              <span
                                key={platform}
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  isDark
                                    ? "bg-white/5 text-zinc-400"
                                    : "bg-zinc-100 text-zinc-600"
                                }`}
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>

                      <div className={`border-t p-4 ${
                        isDark ? "border-white/10" : "border-zinc-100"
                      }`}>
                        <Link
                          href={`/apps/${app.slug}`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                        >
                          مشاهده اپ
                          <ArrowIcon />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className={`rounded-3xl border border-dashed p-10 text-center ${
                  isDark
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-zinc-300 bg-white"
                }`}>
                  <h3 className="text-xl font-black">نتیجه دقیقی پیدا نشد</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-500">
                    عبارت کوتاه‌تر یا کلمه نزدیک‌تری امتحان کن. تحمل غلط تایپی را در مرحله بعد اضافه می‌کنیم.
                  </p>
                </div>
              )}
            </section>

            {similarApps.length > 0 && (
              <section className="mt-20">
                <div className="mb-8">
                  <span className="text-sm font-bold text-emerald-600">
                    شاید این‌ها هم به کارت بیان
                  </span>
                  <h2 className="mt-2 text-3xl font-black">
                    اپ‌های شبیه به «{query}»
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    بر اساس دسته‌بندی و پلتفرم نتیجه‌های اصلی
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {similarApps.map((app) => (
                    <motion.div
                      key={app.id}
                      whileHover={reduceMotion ? undefined : { y: -6 }}
                    >
                      <Link
                        href={`/apps/${app.slug}`}
                        className={`block rounded-3xl border p-5 ${
                          isDark
                            ? "border-white/10 bg-white/[0.025]"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl font-black ${
                            isDark ? "bg-emerald-950" : "bg-emerald-50"
                          }`}>
                            {app.logoUrl ? (
                              <img
                                src={app.logoUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              fallbackIcon(app)
                            )}
                          </span>

                          <div>
                            <span className="text-xs font-bold text-emerald-600">
                              {app.category ?? "اپ مشابه"}
                            </span>
                            <h3 className="mt-1 font-black">
                              {displayName(app)}
                            </h3>
                          </div>
                        </div>

                        <p className="mt-4 line-clamp-2 text-sm leading-7 text-zinc-500">
                          {app.description}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}