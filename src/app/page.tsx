"use client";

import {
  type MouseEvent,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

const apps = [
  {
    name: "ویرایشگر متن آنلاین",
    description:
      "یک ابزار سریع و ساده برای نوشتن، ویرایش و ذخیره متن در مرورگر.",
    category: "ابزار کاربردی",
    version: "1.2.0",
    size: "تحت وب",
    downloads: "۱٬۲۸۰",
    icon: "✍️",
    featured: true,
  },
  {
    name: "تبدیل‌کننده تصویر",
    description:
      "تغییر اندازه و تبدیل فرمت تصاویر، بدون نیاز به نصب برنامه.",
    category: "تصویر و گرافیک",
    version: "2.0.1",
    size: "۸ مگابایت",
    downloads: "۹۴۰",
    icon: "🖼️",
    featured: false,
  },
  {
    name: "مدیریت کارهای روزانه",
    description:
      "کارهای روزانه خود را ثبت، دسته‌بندی و مرحله‌به‌مرحله مدیریت کن.",
    category: "بهره‌وری",
    version: "1.5.3",
    size: "تحت وب",
    downloads: "۷۶۵",
    icon: "✅",
    featured: false,
  },
];

const categories = [
  { name: "ابزارهای تحت وب", count: "۱۲ اپ", icon: "🌐" },
  { name: "بهره‌وری", count: "۸ اپ", icon: "⚡" },
  { name: "تصویر و گرافیک", count: "۶ اپ", icon: "🎨" },
  { name: "برنامه‌نویسی", count: "۵ اپ", icon: "💻" },
];

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

export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

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
      behavior: "smooth",
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

  return (
    <main
      dir="rtl"
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-[#07120c] text-zinc-100"
          : "bg-[#f7faf7] text-[#17211a]"
      }`}
    >
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? "border-white/10 bg-[#07120c]/90"
            : "border-emerald-950/10 bg-white/90"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="/" className="flex items-center gap-3">
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
          </a>

          <nav
            className={`hidden items-center gap-8 text-sm font-bold md:flex ${
              isDark
                ? "text-zinc-300"
                : "text-zinc-600"
            }`}
          >
            <a
              href="/"
              className="text-emerald-500"
            >
              صفحه اصلی
            </a>

            <a
  href="#categories"
  onClick={(event) =>
    handleSectionClick(event, "categories")
  }
  className="transition hover:text-emerald-500"
>
  دسته‌بندی‌ها
</a>

<a
  href="/apps"
  className="transition hover:text-emerald-500"
>
  همه اپ‌ها
</a>

            <a
              href="#about"
              onClick={(event) =>
                handleSectionClick(event, "about")
              }
              className="transition hover:text-emerald-500"
            >
              درباره ما
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="تغییر حالت نمایش"
              title={
                isDark
                  ? "حالت روشن"
                  : "حالت شب"
              }
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

            <a
              href="/admin"
              className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              ورود مدیر
            </a>
          </div>
        </div>
      </header>

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
          <div>
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                isDark
                  ? "border-emerald-700/40 bg-emerald-950/60 text-emerald-400"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              مجموعه‌ای از ابزارهای کاربردی
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.35] tracking-tight sm:text-5xl lg:text-6xl">
              اپ‌های مفید را
              <span className="text-emerald-600">
                {" "}
                پیدا کن، اجرا کن{" "}
              </span>
              و دانلود کن
            </h1>

            <p
              className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${
                isDark
                  ? "text-zinc-400"
                  : "text-zinc-600"
              }`}
            >
              اپ‌خور جایی برای معرفی و دانلود
              اپلیکیشن‌ها و ابزارهای HTML تحت وب
              است؛ ساده، سریع و بدون شلوغی‌های
              اضافه.
            </p>

            <div
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
                  placeholder="نام اپ یا ابزار موردنظرت را جست‌وجو کن..."
                  className={`min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none sm:text-base ${
                    isDark
                      ? "text-white placeholder:text-zinc-600"
                      : "text-zinc-900 placeholder:text-zinc-400"
                  }`}
                />

                <button
                  type="button"
                  className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  جست‌وجو
                </button>
              </div>
            </div>

            <div
              className={`mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm ${
                isDark
                  ? "text-zinc-400"
                  : "text-zinc-600"
              }`}
            >
              <div>
                <strong
                  className={`ml-1 text-xl font-black ${
                    isDark
                      ? "text-white"
                      : "text-zinc-900"
                  }`}
                >
                  ۳۱+
                </strong>
                اپ کاربردی
              </div>

              <div>
                <strong
                  className={`ml-1 text-xl font-black ${
                    isDark
                      ? "text-white"
                      : "text-zinc-900"
                  }`}
                >
                  ۹K+
                </strong>
                دانلود موفق
              </div>

              <div>
                <strong
                  className={`ml-1 text-xl font-black ${
                    isDark
                      ? "text-white"
                      : "text-zinc-900"
                  }`}
                >
                  ۱۰۰٪
                </strong>
                فارسی
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
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
                    پیشنهاد اپ‌خور
                  </span>

                  <h2 className="mt-1 text-xl font-black">
                    ابزارهای محبوب هفته
                  </h2>
                </div>

                <span
                  className={`rounded-xl px-3 py-2 text-xs font-bold ${
                    isDark
                      ? "bg-emerald-950 text-emerald-400"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  به‌روز
                </span>
              </div>

              <div className="space-y-3">
                {apps.map((app, index) => (
                  <div
                    key={app.name}
                    className={`flex items-center gap-4 rounded-2xl border p-4 ${
                      isDark
                        ? "border-white/5 bg-white/[0.03]"
                        : "border-zinc-100 bg-[#fbfdfb]"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
                        isDark
                          ? "bg-emerald-950"
                          : "bg-emerald-100"
                      }`}
                    >
                      {app.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm">
                        {app.name}
                      </strong>

                      <span className="mt-1 block text-xs text-zinc-500">
                        {app.downloads} دانلود
                      </span>
                    </div>

                    <span className="text-sm font-black text-emerald-500">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="categories"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-bold text-emerald-600">
              دسترسی سریع
            </span>

            <h2 className="mt-2 text-3xl font-black">
              دسته‌بندی اپ‌ها
            </h2>
          </div>

          <a
            href="#apps"
            onClick={(event) =>
              handleSectionClick(event, "apps")
            }
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600"
          >
            مشاهده همه دسته‌ها
            <ArrowIcon />
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              href="#apps"
              onClick={(event) =>
                handleSectionClick(event, "apps")
              }
              key={category.name}
              className={`group rounded-2xl border p-5 transition hover:-translate-y-1 ${
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
                  {category.icon}
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
                {category.count}
              </p>
            </a>
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
                تازه‌های اپ‌خور
              </span>

              <h2 className="mt-2 text-3xl font-black">
                جدیدترین اپلیکیشن‌ها
              </h2>
            </div>

            <a
              href="/apps"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600"
            >
              مشاهده همه اپ‌ها
              <ArrowIcon />
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <article
                key={app.name}
                className={`group overflow-hidden rounded-3xl border transition hover:-translate-y-1 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03] hover:border-emerald-700"
                    : "border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-xl"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                        isDark
                          ? "bg-emerald-950"
                          : "bg-emerald-50"
                      }`}
                    >
                      {app.icon}
                    </span>

                    {app.featured && (
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          isDark
                            ? "bg-emerald-950 text-emerald-400"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        پیشنهاد ویژه
                      </span>
                    )}
                  </div>

                  <span className="mt-6 block text-xs font-bold text-emerald-600">
                    {app.category}
                  </span>

                  <h3 className="mt-2 text-xl font-black">
                    {app.name}
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
                        نسخه
                      </span>

                      <strong className="mt-1 block text-xs">
                        {app.version}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-zinc-500">
                        حجم
                      </span>

                      <strong className="mt-1 block text-xs">
                        {app.size}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-zinc-500">
                        دانلود
                      </span>

                      <strong className="mt-1 block text-xs">
                        {app.downloads}
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
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                  >
                    مشاهده و دانلود
                    <DownloadIcon />
                  </button>

                  <button
                    type="button"
                    aria-label={`مشاهده ${app.name}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition hover:border-emerald-500 hover:text-emerald-500 ${
                      isDark
                        ? "border-white/10 text-zinc-400"
                        : "border-zinc-200 text-zinc-500"
                    }`}
                  >
                    <ArrowIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-[#123c28] px-7 py-12 text-white shadow-2xl shadow-emerald-950/20 md:px-12">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-28 right-12 h-64 w-64 rounded-full bg-emerald-500/10" />

          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="text-sm font-bold text-emerald-300">
                همراه اپ‌خور باش
              </span>

              <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
                حمایت تو باعث ساخت ابزارهای کاربردی
                بیشتر می‌شود
              </h2>

              <p className="mt-5 leading-8 text-emerald-50/75">
                اگر اپ‌خور برایت مفید بوده،
                می‌توانی با یک حمایت کوچک به ادامه
                توسعه سایت و اضافه‌شدن ابزارهای جدید
                کمک کنی.
              </p>
            </div>

            <a
              href="https://reymit.ir/saeid_bjn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-black text-emerald-900 transition hover:bg-emerald-50"
            >
              حمایت از اپ‌خور
              <ArrowIcon />
            </a>
          </div>
        </div>
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
                ا
              </span>

              <strong className="text-xl font-black">
                اپ‌خور
              </strong>
            </div>

            <p
              className={`mt-4 max-w-sm text-sm leading-7 ${
                isDark
                  ? "text-zinc-500"
                  : "text-zinc-500"
              }`}
            >
              مرجعی ساده و فارسی برای معرفی، اجرای
              آنلاین و دانلود اپلیکیشن‌ها و ابزارهای
              کاربردی.
            </p>
          </div>

          <div>
            <strong className="font-black">
              دسترسی سریع
            </strong>

            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
              <a
                href="/"
                className="hover:text-emerald-600"
              >
                صفحه اصلی
              </a>

              <a
                href="#apps"
                onClick={(event) =>
                  handleSectionClick(
                    event,
                    "apps",
                  )
                }
                className="hover:text-emerald-600"
              >
                همه اپ‌ها
              </a>

              <a
                href="#categories"
                onClick={(event) =>
                  handleSectionClick(
                    event,
                    "categories",
                  )
                }
                className="hover:text-emerald-600"
              >
                دسته‌بندی‌ها
              </a>
            </div>
          </div>

          <div>
            <strong className="font-black">
              مدیریت سایت
            </strong>

            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-500">
              <a
                href="/admin"
                className="hover:text-emerald-600"
              >
                ورود مدیر
              </a>

              <a
                href="https://reymit.ir/saeid_bjn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600"
              >
                حمایت مالی
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
              تمام حقوق برای اپ‌خور محفوظ است.
            </span>

            <span>
              ساخته‌شده برای کاربران فارسی‌زبان
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}