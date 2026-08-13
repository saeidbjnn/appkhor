"use client";

import Link from "next/link";
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
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = (await response.json()) as MeResponse;

        setUser(data.authenticated ? data.user : null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, []);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        window.location.href = "/";
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
        ورود
      </Link>
    );
  }

  const accountLabel =
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "حساب من";

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
          ▼
        </span>
      </summary>

      <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-900 shadow-xl dark:border-white/10 dark:bg-[#0b1c12] dark:text-zinc-100">
        {user.email && (
          <div className="border-b border-zinc-100 px-3 py-3 dark:border-white/10">
            <p className="text-xs text-zinc-400">
              وارد شده با
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
          className="mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-right text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          {isLoggingOut ? "در حال خروج..." : "خروج از حساب"}
        </button>
      </div>
    </details>
  );
}