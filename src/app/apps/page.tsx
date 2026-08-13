"use client";

import { useEffect, useRef, useState } from "react";
import AuthButton from "@/components/auth/auth-button";
import { useAppTheme } from "@/components/app-theme-provider";
import Link from "next/link";

type TransitionPhase = "idle" | "leaving" | "entering";

const APPS_PER_PAGE = 9;

const allApps = [
  {
    name: "ویرایشگر متن آنلاین",
    category: "ابزار کاربردی",
    description:
      "یک ابزار سریع و ساده برای نوشتن، ویرایش و مدیریت متن‌ها مستقیماً در مرورگر.",
    icon: "✍️",
  },
  {
    name: "تبدیل‌کننده تصویر",
    category: "تصویر و گرافیک",
    description:
      "تبدیل فرمت و تغییر اندازه تصاویر با محیطی ساده و سریع.",
    icon: "🖼️",
  },
  {
    name: "مدیریت کارهای روزانه",
    category: "بهره‌وری",
    description:
      "کارهای روزانه را ثبت، دسته‌بندی و مرحله‌به‌مرحله مدیریت کن.",
    icon: "✅",
  },
  {
    name: "تولید رمز عبور",
    category: "امنیت",
    description:
      "رمزهای عبور قوی و تصادفی برای حساب‌های مختلف ایجاد کن.",
    icon: "🔐",
  },
  {
    name: "تبدیل واحد",
    category: "ابزار کاربردی",
    description:
      "واحدهای پرکاربرد را سریع و بدون محاسبات دستی تبدیل کن.",
    icon: "🔄",
  },
  {
    name: "فشرده‌ساز تصویر",
    category: "تصویر و گرافیک",
    description:
      "حجم تصاویر را کاهش بده و کیفیت مناسب آن‌ها را حفظ کن.",
    icon: "📦",
  },
  {
    name: "یادداشت سریع",
    category: "بهره‌وری",
    description:
      "یادداشت‌های کوتاه و مهم خودت را سریع ثبت و مرتب کن.",
    icon: "📝",
  },
  {
    name: "تولید QR Code",
    category: "ابزار کاربردی",
    description:
      "برای لینک، متن و اطلاعات مختلف QR Code ایجاد کن.",
    icon: "🔳",
  },
  {
    name: "شمارنده متن",
    category: "ابزار کاربردی",
    description:
      "تعداد کلمات، حروف و بخش‌های مختلف متن را سریع محاسبه کن.",
    icon: "🔢",
  },

  // صفحه دوم - فعلاً آزمایشی
  {
    name: "تبدیل متن به PDF",
    category: "اسناد",
    description:
      "متن‌های خودت را سریع به فایل PDF مرتب و قابل دانلود تبدیل کن.",
    icon: "📄",
  },
  {
    name: "ماشین حساب آنلاین",
    category: "ابزار کاربردی",
    description:
      "محاسبات روزمره را با یک ماشین حساب ساده و سریع انجام بده.",
    icon: "🧮",
  },
  {
    name: "تغییر اندازه تصویر",
    category: "تصویر و گرافیک",
    description:
      "عرض و ارتفاع تصاویر را بدون پیچیدگی به اندازه دلخواه تغییر بده.",
    icon: "📐",
  },
  {
    name: "تایمر تمرکز",
    category: "بهره‌وری",
    description:
      "زمان کار و استراحت خودت را مدیریت کن و تمرکز بیشتری داشته باش.",
    icon: "⏱️",
  },
  {
    name: "ساخت لینک کوتاه",
    category: "ابزار کاربردی",
    description:
      "لینک‌های طولانی را برای استفاده و اشتراک‌گذاری ساده‌تر آماده کن.",
    icon: "🔗",
  },
  {
    name: "انتخاب رنگ",
    category: "طراحی",
    description:
      "رنگ مناسب را انتخاب کن و کدهای موردنیاز طراحی را سریع دریافت کن.",
    icon: "🎨",
  },
  {
    name: "تبدیل تاریخ",
    category: "ابزار کاربردی",
    description:
      "تاریخ‌های مختلف را به‌سادگی بین فرمت‌های پرکاربرد تبدیل کن.",
    icon: "📅",
  },
  {
    name: "مرتب‌کننده لیست",
    category: "بهره‌وری",
    description:
      "لیست‌های متنی را مرتب، پاک‌سازی و برای استفاده آماده کن.",
    icon: "📋",
  },
  {
    name: "تولید متن آزمایشی",
    category: "برنامه‌نویسی",
    description:
      "متن نمونه برای طراحی صفحات، تست رابط کاربری و پروژه‌ها تولید کن.",
    icon: "💻",
  },

  // صفحه سوم - فعلاً آزمایشی
  {
    name: "تبدیل JSON",
    category: "برنامه‌نویسی",
    description:
      "داده‌های JSON را مرتب و خواناتر کن و ساختار آن‌ها را بررسی کن.",
    icon: "🧩",
  },
  {
    name: "تبدیل Base64",
    category: "برنامه‌نویسی",
    description:
      "متن و داده‌های موردنیاز را به Base64 تبدیل یا از آن خارج کن.",
    icon: "🔤",
  },
  {
    name: "انتخاب تصادفی",
    category: "ابزار کاربردی",
    description:
      "از بین چند گزینه، یک مورد را به‌شکل کاملاً تصادفی انتخاب کن.",
    icon: "🎲",
  },
  {
    name: "محاسبه درصد",
    category: "ابزار کاربردی",
    description:
      "درصد افزایش، کاهش و نسبت بین اعداد را سریع محاسبه کن.",
    icon: "％",
  },
  {
    name: "تبدیل زمان",
    category: "ابزار کاربردی",
    description:
      "ساعت و زمان را میان حالت‌ها و واحدهای مختلف تبدیل کن.",
    icon: "🕒",
  },
  {
    name: "پاک‌سازی متن",
    category: "ابزار کاربردی",
    description:
      "فاصله‌ها و کاراکترهای اضافی متن را حذف و متن را مرتب کن.",
    icon: "🧹",
  },
  {
    name: "بررسی رمز عبور",
    category: "امنیت",
    description:
      "قدرت رمز عبور را بررسی کن و برای افزایش امنیت پیشنهاد بگیر.",
    icon: "🛡️",
  },
  {
    name: "تبدیل فرمت عدد",
    category: "ابزار کاربردی",
    description:
      "اعداد را میان حالت‌ها و قالب‌های مختلف به‌سادگی تبدیل کن.",
    icon: "🔣",
  },
  {
    name: "دفترچه آنلاین",
    category: "بهره‌وری",
    description:
      "متن‌ها و یادداشت‌های کوتاه خودت را در محیطی ساده مدیریت کن.",
    icon: "📒",
  },
];

const freshApps = allApps.slice(0, 5);

export default function AppsPage() {
  const { isDark, mounted, toggleTheme } = useAppTheme();

  const [currentPage, setCurrentPage] = useState(1);
  const [transitionPhase, setTransitionPhase] =
    useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPageChanging, setIsPageChanging] = useState(false);

  const appsSectionRef = useRef<HTMLElement | null>(null);


  const totalPages = Math.ceil(allApps.length / APPS_PER_PAGE);

  const startIndex = (currentPage - 1) * APPS_PER_PAGE;
  const currentApps = allApps.slice(
    startIndex,
    startIndex + APPS_PER_PAGE,
  );

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

      if (Math.abs(distance) < 5) {
        resolve();
        return;
      }

      const duration = 900;
      const htmlElement = document.documentElement;

      // جلوگیری از تداخل smooth سراسری سایت با انیمیشن دستی
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

    // مرحله ۱: اول اسکرول نرم و کشی تا ابتدای بخش همه اپلیکیشن‌ها
    await scrollToApps();

    // مرحله ۲: کارت‌های فعلی بعد از پایان اسکرول خارج می‌شوند
    setTransitionPhase("leaving");
    await wait(500);

    // مرحله ۳: صفحه اپ‌ها عوض می‌شود
    setCurrentPage(page);

    const newUrl =
      page === 1
        ? "/apps"
        : `/apps?page=${page}`;

    window.history.pushState(
      { page },
      "",
      newUrl,
    );

    // مرحله ۴: کارت‌های جدید نرم وارد می‌شوند
    setTransitionPhase("entering");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransitionPhase("idle");
      });
    });

    await wait(600);
    setIsPageChanging(false);
  }

  function getCardsAnimationClass() {
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
      className={`appkhor-page-enter min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-[#07120c] text-zinc-100"
          : "bg-[#f7faf7] text-[#17211a]"
      }`}
    >
      {/* Header */}
      <header
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
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
            </button>

            <a
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
            </a>

            <AuthButton />
          </div>
        </div>
      </header>

      {/* Page Title */}
      <section
        className={`relative overflow-hidden border-b ${
          isDark
            ? "border-emerald-950/80 bg-[#02150d]"
            : "border-emerald-200 bg-[#e4f4ea]"
        }`}
      >
        {/* لایه‌ی پایه‌ی سبز */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(180deg, #02150d 0%, #052619 55%, #062d1d 100%)"
              : "linear-gradient(180deg, #edf8f1 0%, #d7eddf 55%, #c3e3cf 100%)",
          }}
        />

        {/* هاله‌ی سبز مرکزی */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-3xl"
          style={{
            background: isDark
              ? "radial-gradient(ellipse, rgba(16,185,129,0.30) 0%, rgba(5,150,105,0.14) 42%, transparent 72%)"
              : "radial-gradient(ellipse, rgba(5,150,105,0.30) 0%, rgba(16,185,129,0.16) 42%, transparent 72%)",
          }}
        />

        {/* موج اول */}
        <div
          className="pointer-events-none absolute -bottom-32 left-1/2 h-[280px] w-[120%] -translate-x-1/2 rounded-[50%] border"
          style={{
            borderColor: isDark
              ? "rgba(52,211,153,0.14)"
              : "rgba(4,120,87,0.24)",
            boxShadow: isDark
              ? "0 -30px 90px rgba(16,185,129,0.08)"
              : "0 -30px 90px rgba(16,185,129,0.08)",
          }}
        />

        {/* موج دوم */}
        <div
          className="pointer-events-none absolute -bottom-44 left-1/2 h-[330px] w-[145%] -translate-x-1/2 rounded-[50%] border"
          style={{
            borderColor: isDark
              ? "rgba(52,211,153,0.09)"
              : "rgba(4,120,87,0.17)",
          }}
        />

        {/* هاله‌ی کناری چپ */}
        <div
          className="pointer-events-none absolute -left-24 top-4 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: isDark
              ? "rgba(5,150,105,0.14)"
              : "rgba(5,150,105,0.18)",
          }}
        />

        {/* هاله‌ی کناری راست */}
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full blur-3xl"
          style={{
            background: isDark
              ? "rgba(34,197,94,0.12)"
              : "rgba(4,120,87,0.16)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 text-center lg:px-8 lg:py-24">
          <span
            className={`text-sm font-bold ${
              isDark ? "text-emerald-400" : "text-emerald-700"
            }`}
          >
            دنیای اپ‌خور
          </span>

          <h1
            className={`mt-3 text-4xl font-black sm:text-5xl ${
              isDark ? "text-white" : "text-emerald-950"
            }`}
          >
            همه اپ‌ها
          </h1>

          <p
            className={`mx-auto mt-5 max-w-2xl text-base leading-8 sm:text-lg ${
              isDark ? "text-emerald-50/70" : "text-emerald-950/65"
            }`}
          >
            هرچی اپ کاربردی بخوای، اینجاست؛ تازه‌ها رو ببین و ابزار مناسب خودت رو پیدا کن.
          </p>
        </div>
      </section>

      {/* Fresh Apps */}
      <section
        className={`relative overflow-hidden ${
          isDark
            ? ""
            : "border-y border-emerald-200/70 bg-[#dff5e7]"
        }`}
      >
        {/* هاله و موج سبز تیره‌تر فقط در حالت لایت */}
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
                boxShadow: "0 -35px 100px rgba(5,150,105,0.10)",
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
          <div className="mb-8">
            <span
              className={`text-sm font-bold ${
                isDark ? "text-emerald-600" : "text-emerald-800"
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
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {freshApps.map((app) => (
              <article
                key={app.name}
                className={`group flex min-h-[300px] flex-col rounded-3xl border p-5 transition duration-200 hover:-translate-y-1 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03] shadow-[0_14px_45px_rgba(255,255,255,0.05)] hover:border-white/25 hover:shadow-[0_18px_60px_rgba(255,255,255,0.10)]"
                    : "border-emerald-200/80 bg-white/95 shadow-[0_14px_45px_rgba(5,150,105,0.12)] hover:border-emerald-400 hover:shadow-[0_18px_60px_rgba(5,150,105,0.22)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                      isDark
                        ? "bg-emerald-950"
                        : "bg-emerald-100/80"
                    }`}
                  >
                    {app.icon}
                  </span>

                  <div className="min-w-0">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-emerald-600" : "text-emerald-800"
                      }`}
                    >
                      {app.category}
                    </span>

                    <h3 className="mt-1 min-h-[48px] text-base font-black leading-6">
                      {app.name}
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

                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  دانلود
                  <span aria-hidden="true">↓</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All Apps */}
      <section
        ref={appsSectionRef}
        className={`relative overflow-hidden border-t ${
          isDark
            ? "border-white/10 bg-[#091810]"
            : "border-emerald-100 bg-[#effcf4]"
        }`}
      >
        {/* افکت هاله و موج برای هر دو حالت لایت و دارک */}
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

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8">          <div className="mb-10">
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
          </div>

          <div
            className={`grid gap-6 transition-all duration-[500ms] ease-in-out md:grid-cols-2 xl:grid-cols-3 ${getCardsAnimationClass()}`}
          >
            {currentApps.map((app) => (
              <article
                key={app.name}
                className={`group flex flex-col overflow-hidden rounded-3xl border transition hover:-translate-y-1 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03] shadow-[0_14px_45px_rgba(255,255,255,0.05)] hover:border-white/25 hover:shadow-[0_18px_60px_rgba(255,255,255,0.10)]"
                    : "border-emerald-200/80 bg-white/95 shadow-[0_14px_45px_rgba(5,150,105,0.12)] hover:border-emerald-400 hover:shadow-[0_18px_60px_rgba(5,150,105,0.22)]"
                }`}
              >
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${
                        isDark
                          ? "bg-emerald-950"
                          : "bg-emerald-50"
                      }`}
                    >
                      {app.icon}
                    </span>

                    <div>
                      <span className="text-xs font-bold text-emerald-600">
                        {app.category}
                      </span>

                      <h3 className="mt-2 text-xl font-black">
                        {app.name}
                      </h3>
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
                </div>

                <div
                  className={`border-t p-4 ${
                    isDark
                      ? "border-white/10"
                      : "border-zinc-100"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    دانلود
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => changePage(currentPage - 1)}
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
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => changePage(page)}
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
              </button>
            ))}

            <button
              type="button"
              onClick={() => changePage(currentPage + 1)}
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
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}