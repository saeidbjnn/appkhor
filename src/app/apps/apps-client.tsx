"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import AuthButton from "@/components/auth/auth-button";
import { useAppTheme } from "@/components/app-theme-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { CatalogApp } from "./page";
import SiteSearchButton from "@/components/site-search-button";

type TransitionPhase = "idle" | "leaving" | "entering";

const APPS_PER_PAGE = 9;

type AppsClientProps = {
  apps: CatalogApp[];
  initialQuery: string;
};

function displayName(app: CatalogApp) {
  return app.nameFa || app.name;
}

function fallbackIcon(app: CatalogApp) {
  return displayName(app).trim().slice(0, 1).toUpperCase() || "ا";
}

export default function AppsClient({
  apps,
  initialQuery,
}: AppsClientProps) {
  const { isDark, mounted, toggleTheme } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const [search, setSearch] = useState(initialQuery);

  const [currentPage, setCurrentPage] = useState(1);
  const [transitionPhase, setTransitionPhase] =
    useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPageChanging, setIsPageChanging] = useState(false);

  const appsSectionRef = useRef<HTMLElement | null>(null);

  const totalPages = Math.max(
    1,
    Math.ceil(apps.length / APPS_PER_PAGE),
  );

  const startIndex = (currentPage - 1) * APPS_PER_PAGE;
  const currentApps = apps.slice(
    startIndex,
    startIndex + APPS_PER_PAGE,
  );

  const freshApps = apps.slice(0, 5);

  useEffect(() => {
    setSearch(initialQuery);
    setCurrentPage(1);
  }, [initialQuery]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPage = Number(params.get("page") ?? "1");

    if (
      Number.isInteger(requestedPage) &&
      requestedPage >= 1 &&
      requestedPage <= totalPages
    ) {
      setCurrentPage(requestedPage);
    }

    function handlePopState() {
      const newParams = new URLSearchParams(window.location.search);
      const page = Number(newParams.get("page") ?? "1");

      if (
        Number.isInteger(page) &&
        page >= 1 &&
        page <= totalPages
      ) {
        setCurrentPage(page);
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [totalPages]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push("/apps");
      return;
    }

    router.push(`/apps?q=${encodeURIComponent(query)}`);
  }

  function clearSearch() {
    setSearch("");
    router.push("/apps");
  }

  function scrollToApps(): Promise<void> {
    return new Promise((resolve) => {
      if (!appsSectionRef.current) {
        resolve();
        return;
      }

      const headerOffset = 96;
      const startPosition = window.scrollY;

      const targetPosition =
        appsSectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      const distance = targetPosition - startPosition;

      if (Math.abs(distance) < 5 || reduceMotion) {
        window.scrollTo(0, targetPosition);
        resolve();
        return;
      }

      const duration = 900;
      const htmlElement = document.documentElement;
      const previousScrollBehavior = htmlElement.style.scrollBehavior;
      htmlElement.style.scrollBehavior = "auto";

      let startTime: number | null = null;

      function easeInOutCubic(progress: number) {
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      }

      function animateScroll(currentTime: number) {
        if (startTime === null) {
          startTime = currentTime;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        window.scrollTo(
          0,
          startPosition + distance * easedProgress,
        );

        if (progress < 1) {
          window.requestAnimationFrame(animateScroll);
        } else {
          htmlElement.style.scrollBehavior = previousScrollBehavior;
          resolve();
        }
      }

      window.requestAnimationFrame(animateScroll);
    });
  }

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  async function changePage(page: number) {
    if (
      page === currentPage ||
      page < 1 ||
      page > totalPages ||
      isPageChanging
    ) {
      return;
    }

    const nextDirection: 1 | -1 =
      page > currentPage ? 1 : -1;

    setDirection(nextDirection);
    setIsPageChanging(true);

    await scrollToApps();

    setTransitionPhase("leaving");
    await wait(reduceMotion ? 0 : 500);

    setCurrentPage(page);

    const params = new URLSearchParams();

    if (initialQuery) {
      params.set("q", initialQuery);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/apps?${queryString}` : "/apps";

    window.history.pushState(
      { page },
      "",
      newUrl,
    );

    setTransitionPhase("entering");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransitionPhase("idle");
      });
    });

    await wait(reduceMotion ? 0 : 600);
    setIsPageChanging(false);
  }

  function getCardsAnimationClass() {
    if (reduceMotion) {
      return "translate-x-0 opacity-100";
    }

    if (transitionPhase === "leaving") {
      return direction === 1
        ? "translate-x-5 opacity-0"
        : "-translate-x-5 opacity-0";
    }

    if (transitionPhase === "entering") {
      return direction === 1
        ? "-translate-x-5 opacity-0"
        : "translate-x-5 opacity-0";
    }

    return "translate-x-0 opacity-100";
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
              className="transition hover:text-emerald-500"
            >
              دسته‌بندی‌ها
            </Link>

            <Link
              href="/apps"
              className="text-emerald-500"
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

        <div
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
                : "text-emerald-700"
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
            همه اپ‌ها
          </h1>

          <p
            className={`mx-auto mt-5 max-w-2xl text-base leading-8 sm:text-lg ${
              isDark
                ? "text-emerald-50/70"
                : "text-emerald-950/65"
            }`}
          >
            هرچی اپ کاربردی بخوای، اینجاست؛ تازه‌ها رو ببین و ابزار مناسب خودت رو پیدا کن.
          </p>

          <form
            onSubmit={handleSearch}
            className={`mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border p-2 text-right shadow-xl backdrop-blur-xl ${
              isDark
                ? "border-white/10 bg-black/20 shadow-black/20"
                : "border-emerald-900/10 bg-white/80 shadow-emerald-900/10"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isDark
                  ? "bg-white/5 text-zinc-400"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              🔎
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="نام اپ، سازنده یا دسته‌بندی را جست‌وجو کن..."
              className={`min-w-0 flex-1 bg-transparent px-1 py-3 text-sm font-semibold outline-none sm:text-base ${
                isDark
                  ? "text-white placeholder:text-zinc-500"
                  : "text-emerald-950 placeholder:text-zinc-400"
              }`}
            />

            {initialQuery && (
              <motion.button
                type="button"
                onClick={clearSearch}
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                className={`hidden rounded-xl px-3 py-3 text-xs font-bold transition sm:block ${
                  isDark
                    ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                پاک کردن
              </motion.button>
            )}

            <motion.button
              type="submit"
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="shrink-0 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800"
            >
              جست‌وجو
            </motion.button>
          </form>

          {initialQuery && (
            <p
              className={`mx-auto mt-4 max-w-2xl text-sm ${
                isDark ? "text-emerald-100/60" : "text-emerald-950/60"
              }`}
            >
              {apps.length > 0 ? (
                <>
                  {apps.length.toLocaleString("fa-IR")} نتیجه برای{" "}
                  <strong className="font-black">«{initialQuery}»</strong>
                </>
              ) : (
                <>
                  نتیجه‌ای برای{" "}
                  <strong className="font-black">«{initialQuery}»</strong> پیدا نشد.
                </>
              )}
            </p>
          )}
        </Reveal>
      </section>

      <section
        className={`relative overflow-hidden ${
          isDark
            ? ""
            : "border-y border-emerald-200/70 bg-[#dff5e7]"
        }`}
      >
        {!isDark && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #e8f8ee 0%, #d8f1e2 48%, #ccebd8 100%)",
              }}
            />

            <div
              className="pointer-events-none absolute left-1/2 top-16 h-[430px] w-[850px] -translate-x-1/2 rounded-[50%] blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(5,150,105,0.22) 0%, rgba(16,185,129,0.12) 42%, transparent 72%)",
              }}
            />

            <div
              className="pointer-events-none absolute -bottom-32 left-1/2 h-[280px] w-[125%] -translate-x-1/2 rounded-[50%] border"
              style={{
                borderColor: "rgba(5,150,105,0.22)",
                boxShadow:
                  "0 -35px 100px rgba(5,150,105,0.10)",
              }}
            />

            <div
              className="pointer-events-none absolute -bottom-44 left-1/2 h-[340px] w-[150%] -translate-x-1/2 rounded-[50%] border"
              style={{
                borderColor: "rgba(4,120,87,0.14)",
              }}
            />

            <div
              className="pointer-events-none absolute -left-24 top-6 h-80 w-80 rounded-full blur-3xl"
              style={{
                background: "rgba(4,120,87,0.14)",
              }}
            />

            <div
              className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl"
              style={{
                background: "rgba(5,150,105,0.13)",
              }}
            />
          </>
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <Reveal className="mb-8">
            <span
              className={`text-sm font-bold ${
                isDark
                  ? "text-emerald-600"
                  : "text-emerald-800"
              }`}
            >
              تازه‌های اپ‌خور
            </span>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              برنامه‌های تازه
            </h2>

            <p
              className={`mt-2 text-sm leading-7 ${
                isDark
                  ? "text-zinc-400"
                  : "text-emerald-950/65"
              }`}
            >
              جدیدترین برنامه‌ها و ابزارهایی که به اپ‌خور اضافه شده‌اند.
            </p>
          </Reveal>

          {freshApps.length > 0 ? (
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {freshApps.map((app) => (
                <StaggerItem key={app.id}>
                  <motion.article
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -7, scale: 1.012 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                    }}
                    className={`group flex min-h-[300px] flex-col rounded-3xl border p-5 transition duration-200 ${
                      isDark
                        ? "border-white/10 bg-white/[0.03] shadow-[0_14px_45px_rgba(255,255,255,0.05)] hover:border-white/25 hover:shadow-[0_18px_60px_rgba(255,255,255,0.10)]"
                        : "border-emerald-200/80 bg-white/95 shadow-[0_14px_45px_rgba(5,150,105,0.12)] hover:border-emerald-400 hover:shadow-[0_18px_60px_rgba(5,150,105,0.22)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-2xl font-black ${
                          isDark
                            ? "bg-emerald-950"
                            : "bg-emerald-100/80"
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
                      </span>

                      <div className="min-w-0">
                        <span
                          className={`text-xs font-bold ${
                            isDark
                              ? "text-emerald-600"
                              : "text-emerald-800"
                          }`}
                        >
                          {app.category ?? "بدون دسته‌بندی"}
                        </span>

                        <h3 className="mt-1 min-h-[48px] text-base font-black leading-6">
                          {displayName(app)}
                        </h3>
                      </div>
                    </div>

                    <p
                      className={`mt-5 flex-1 text-sm leading-7 ${
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
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                      >
                        مشاهده اپ
                        <span aria-hidden="true">←</span>
                      </Link>
                    </motion.div>
                  </motion.article>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <div
              className={`rounded-3xl border p-8 text-center text-sm font-bold ${
                isDark
                  ? "border-white/10 bg-white/[0.03] text-zinc-400"
                  : "border-emerald-200 bg-white/70 text-zinc-600"
              }`}
            >
              هنوز اپ منتشرشده‌ای وجود ندارد.
            </div>
          )}
        </div>
      </section>

      <section
        ref={appsSectionRef}
        className={`relative overflow-hidden border-t ${
          isDark
            ? "border-white/10 bg-[#091810]"
            : "border-emerald-100 bg-[#effcf4]"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(180deg, #031009 0%, #04180f 48%, #052015 100%)"
              : "linear-gradient(180deg, #e4f5ea 0%, #d1ecd9 48%, #bde2ca 100%)",
          }}
        />

        <div
          className="pointer-events-none absolute left-1/2 top-24 h-[460px] w-[900px] -translate-x-1/2 rounded-[50%] blur-3xl"
          style={{
            background: isDark
              ? "radial-gradient(ellipse, rgba(5,150,105,0.18) 0%, rgba(4,120,87,0.10) 42%, transparent 72%)"
              : "radial-gradient(ellipse, rgba(5,150,105,0.24) 0%, rgba(4,120,87,0.12) 42%, transparent 72%)",
          }}
        />

        <div
          className="pointer-events-none absolute -top-28 left-1/2 h-[300px] w-[125%] -translate-x-1/2 rounded-[50%] border"
          style={{
            borderColor: isDark
              ? "rgba(16,185,129,0.10)"
              : "rgba(5,150,105,0.20)",
            boxShadow: isDark
              ? "0 35px 100px rgba(16,185,129,0.07)"
              : "0 35px 100px rgba(16,185,129,0.08)",
          }}
        />

        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[350px] w-[150%] -translate-x-1/2 rounded-[50%] border"
          style={{
            borderColor: isDark
              ? "rgba(16,185,129,0.06)"
              : "rgba(4,120,87,0.13)",
          }}
        />

        <div
          className="pointer-events-none absolute -left-28 top-1/3 h-96 w-96 rounded-full blur-3xl"
          style={{
            background: isDark
              ? "rgba(4,120,87,0.09)"
              : "rgba(4,120,87,0.14)",
          }}
        />

        <div
          className="pointer-events-none absolute -right-28 bottom-16 h-96 w-96 rounded-full blur-3xl"
          style={{
            background: isDark
              ? "rgba(5,150,105,0.08)"
              : "rgba(5,150,105,0.13)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Reveal className="mb-10">
            <span className="text-sm font-bold text-emerald-600">
              همه ابزارها
            </span>

            <h2 className="mt-2 text-3xl font-black">
              همه اپلیکیشن‌ها
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${
                isDark
                  ? "text-zinc-400"
                  : "text-zinc-500"
              }`}
            >
              اپ‌ها بر اساس زمان انتشار مرتب شده‌اند؛ جدیدترین‌ها اول نمایش داده می‌شوند.
            </p>
          </Reveal>

          {currentApps.length > 0 ? (
            <div
              className={`grid gap-6 transition-all duration-[500ms] ease-in-out md:grid-cols-2 xl:grid-cols-3 ${getCardsAnimationClass()}`}
            >
              {currentApps.map((app) => (
                <motion.article
                  key={app.id}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 16,
                          scale: 0.985,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -7, scale: 1.01 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 24,
                  }}
                  className={`group flex flex-col overflow-hidden rounded-3xl border transition ${
                    isDark
                      ? "border-white/10 bg-white/[0.03] shadow-[0_14px_45px_rgba(255,255,255,0.05)] hover:border-white/25 hover:shadow-[0_18px_60px_rgba(255,255,255,0.10)]"
                      : "border-emerald-200/80 bg-white/95 shadow-[0_14px_45px_rgba(5,150,105,0.12)] hover:border-emerald-400 hover:shadow-[0_18px_60px_rgba(5,150,105,0.22)]"
                  }`}
                >
                  <Link
                    href={`/apps/${app.slug}`}
                    className="flex flex-1 flex-col p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-3xl font-black ${
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
                          fallbackIcon(app)
                        )}
                      </span>

                      <div>
                        <span className="text-xs font-bold text-emerald-600">
                          {app.category ?? "بدون دسته‌بندی"}
                        </span>

                        <h3 className="mt-2 text-xl font-black">
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
                      </div>
                    </div>

                    <p
                      className={`mt-5 flex-1 text-sm leading-7 ${
                        isDark
                          ? "text-zinc-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {app.description}
                    </p>
                  </Link>

                  <div
                    className={`border-t p-4 ${
                      isDark
                        ? "border-white/10"
                        : "border-zinc-100"
                    }`}
                  >
                    {app.primaryLinkId ? (
                      <motion.div
                        whileHover={
                          reduceMotion
                            ? undefined
                            : { y: -2, scale: 1.012 }
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
                      >
                        <Link
                          href={`/go/${app.primaryLinkId}`}
                          className="block w-full rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-800"
                        >
                          دریافت از منبع رسمی
                        </Link>
                      </motion.div>
                    ) : (
                      <Link
                        href={`/apps/${app.slug}`}
                        className="block w-full rounded-xl border border-emerald-700/20 px-4 py-3 text-center text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        مشاهده جزئیات
                      </Link>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div
              className={`rounded-3xl border p-10 text-center ${
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-emerald-200 bg-white/75"
              }`}
            >
              <p className="font-black">
                هنوز اپ منتشرشده‌ای برای نمایش وجود ندارد.
              </p>
            </div>
          )}

          {apps.length > APPS_PER_PAGE && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <motion.button
                type="button"
                onClick={() => changePage(currentPage - 1)}
                whileHover={
                  reduceMotion || currentPage === 1
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  reduceMotion || currentPage === 1
                    ? undefined
                    : { scale: 0.95 }
                }
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                }}
                disabled={
                  currentPage === 1 ||
                  isPageChanging
                }
                className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                  currentPage === 1
                    ? "cursor-not-allowed opacity-40"
                    : isDark
                      ? "border-white/10 hover:border-emerald-700 hover:text-emerald-400"
                      : "border-zinc-200 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                قبلی
              </motion.button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              ).map((page) => (
                <motion.button
                  key={page}
                  type="button"
                  onClick={() => changePage(page)}
                  whileHover={
                    reduceMotion || currentPage === page
                      ? undefined
                      : { y: -2, scale: 1.04 }
                  }
                  whileTap={
                    reduceMotion
                      ? undefined
                      : { scale: 0.94 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 24,
                  }}
                  disabled={isPageChanging}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-black transition ${
                    currentPage === page
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : isDark
                        ? "border-white/10 hover:border-emerald-700 hover:text-emerald-400"
                        : "border-zinc-200 bg-white hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {page.toLocaleString("fa-IR")}
                </motion.button>
              ))}

              <motion.button
                type="button"
                onClick={() => changePage(currentPage + 1)}
                whileHover={
                  reduceMotion ||
                  currentPage === totalPages
                    ? undefined
                    : { y: -2 }
                }
                whileTap={
                  reduceMotion ||
                  currentPage === totalPages
                    ? undefined
                    : { scale: 0.95 }
                }
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                }}
                disabled={
                  currentPage === totalPages ||
                  isPageChanging
                }
                className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-40"
                    : isDark
                      ? "border-white/10 hover:border-emerald-700 hover:text-emerald-400"
                      : "border-zinc-200 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                بعدی
              </motion.button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}