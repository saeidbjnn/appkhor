"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  emailVerified: boolean;
};

type MeResponse = {
  authenticated: boolean;
  user: CurrentUser | null;
};

export default function AuthButton() {
  const pathname = usePathname();

  const isEnglish =
    pathname === "/en" ||
    pathname.startsWith("/en/");

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data =
          (await response.json()) as MeResponse;

        setUser(
          data.authenticated
            ? data.user
            : null,
        );
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    function handleProfileUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          displayName?: string | null;
        }>;

      setUser((current) =>
        current
          ? {
              ...current,
              displayName:
                customEvent.detail
                  ?.displayName ??
                null,
            }
          : current,
      );
    }

    void loadUser();

    window.addEventListener(
      "appkhor:profile-updated",
      handleProfileUpdated,
    );

    return () => {
      window.removeEventListener(
        "appkhor:profile-updated",
        handleProfileUpdated,
      );
    };
  }, []);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        },
      );

      if (response.ok) {
        setUser(null);

        window.location.href =
          isEnglish ? "/en" : "/";
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="h-10 w-[72px] animate-pulse rounded-xl bg-emerald-700/20"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
      >
        {isEnglish
          ? "Sign in"
          : "\u0648\u0631\u0648\u062f"}
      </Link>
    );
  }

  const accountLabel =
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    (isEnglish
      ? "My account"
      : "\u062d\u0633\u0627\u0628 \u0645\u0646");

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 [&::-webkit-details-marker]:hidden">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
          {accountLabel.slice(0, 1)}
        </span>

        <span className="max-w-28 truncate">
          {accountLabel}
        </span>

        <span className="text-[10px] transition group-open:rotate-180">
          {"\u25BC"}
        </span>
      </summary>

      <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-900 shadow-xl dark:border-white/10 dark:bg-[#0b1c12] dark:text-zinc-100">
        <Link
          href="/account"
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold transition hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 ${
            isEnglish
              ? "text-left"
              : "text-right"
          }`}
        >
          {isEnglish
            ? "My account"
            : "\u062d\u0633\u0627\u0628 \u0645\u0646"}
        </Link>

        {user.email && (
          <div className="border-b border-zinc-100 px-3 py-3 dark:border-white/10">
            <p className="text-xs text-zinc-400">
              {isEnglish
                ? "Signed in as"
                : "\u0648\u0627\u0631\u062f \u0634\u062f\u0647 \u0628\u0627"}
            </p>

            <p
              dir="ltr"
              className="mt-1 truncate text-left text-sm font-bold"
            >
              {user.email}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30 ${
            isEnglish
              ? "text-left"
              : "text-right"
          }`}
        >
          {isLoggingOut
            ? isEnglish
              ? "Signing out..."
              : "\u062f\u0631 \u062d\u0627\u0644 \u062e\u0631\u0648\u062c..."
            : isEnglish
              ? "Sign out"
              : "\u062e\u0631\u0648\u062c \u0627\u0632 \u062d\u0633\u0627\u0628"}
        </button>
      </div>
    </details>
  );
}