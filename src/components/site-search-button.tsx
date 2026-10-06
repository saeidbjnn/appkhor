"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useAppTheme } from "@/components/app-theme-provider";

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

export default function SiteSearchButton() {
  const { isDark } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  const isEnglish =
    pathname === "/en" ||
    pathname.startsWith("/en/");

  const searchHref =
    isEnglish ? "/en/apps" : "/search";

  return (
    <motion.div
      whileHover={
        reduceMotion
          ? undefined
          : { y: -2, scale: 1.03 }
      }
      whileTap={
        reduceMotion
          ? undefined
          : { scale: 0.95 }
      }
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 24,
      }}
    >
      <Link
        href={searchHref}
        aria-label={
          isEnglish
            ? "Search AppKhor"
            : "\u062c\u0633\u062a\u200c\u0648\u062c\u0648 \u062f\u0631 \u0627\u067e\u200c\u062e\u0648\u0631"
        }
        title={
          isEnglish
            ? "Search"
            : "\u062c\u0633\u062a\u200c\u0648\u062c\u0648"
        }
        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
          isDark
            ? "border-white/10 bg-white/5 text-zinc-300 hover:border-emerald-700 hover:bg-emerald-950/40 hover:text-emerald-400"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        }`}
      >
        <SearchIcon />
      </Link>
    </motion.div>
  );
}