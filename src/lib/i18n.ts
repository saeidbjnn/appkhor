export const locales = ["fa", "en"] as const;

export type Locale =
  (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export function isLocale(
  value: string,
): value is Locale {
  return locales.includes(
    value as Locale,
  );
}

export function getDirection(
  locale: Locale,
): "rtl" | "ltr" {
  return locale === "fa"
    ? "rtl"
    : "ltr";
}

export function localizePath(
  pathname: string,
  locale: Locale,
): string {
  const normalized =
    pathname.startsWith("/")
      ? pathname
      : "/" + pathname;

  if (locale === defaultLocale) {
    return normalized;
  }

  if (normalized === "/") {
    return "/en";
  }

  return "/en" + normalized;
}

export function removeLocalePrefix(
  pathname: string,
): string {
  if (pathname === "/en") {
    return "/";
  }

  if (pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }

  return pathname;
}
