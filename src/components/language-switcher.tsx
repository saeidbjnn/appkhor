"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  localizePath,
  removeLocalePrefix,
} from "@/lib/i18n";

export default function LanguageSwitcher() {
  const pathname = usePathname();

  const isEnglish =
    pathname === "/en" ||
    pathname.startsWith("/en/");

  const basePath =
    removeLocalePrefix(pathname);

  const href = localizePath(
    basePath,
    isEnglish ? "fa" : "en",
  );

  return (
    <Link
      href={href}
      hrefLang={isEnglish ? "fa" : "en"}
      className="inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition hover:bg-muted"
      aria-label={
        isEnglish
          ? "Switch to Persian"
          : "Switch to English"
      }
    >
      {isEnglish ? "?????" : "English"}
    </Link>
  );
}
