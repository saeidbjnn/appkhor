"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("appkhor-theme") as Theme | null;

    const systemTheme: Theme = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme ?? systemTheme;

    setTheme(initialTheme);
    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark",
    );

    setMounted(true);
  }, []);

  function toggleTheme() {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("appkhor-theme", newTheme);

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark",
    );
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="تغییر حالت نمایش"
        className="h-10 w-10 rounded-xl border border-zinc-200 bg-white"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "فعال‌کردن حالت روشن" : "فعال‌کردن حالت شب"
      }
      title={theme === "dark" ? "حالت روشن" : "حالت شب"}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-lg transition hover:border-emerald-300 hover:bg-emerald-50"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}