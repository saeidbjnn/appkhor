"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AuthButton from "@/components/auth/auth-button";
import { useAppTheme } from "@/components/app-theme-provider";

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

function roleLabel(role: CurrentUser["role"]) {
  if (role === "SUPER_ADMIN") {
    return "\u0645\u062f\u06cc\u0631 \u0627\u0631\u0634\u062f";
  }

  if (role === "ADMIN") {
    return "\u0645\u062f\u06cc\u0631";
  }

  return "\u06a9\u0627\u0631\u0628\u0631";
}

export default function AccountPage() {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/auth");
          return;
        }

        const data =
          (await response.json()) as MeResponse;

        if (!data.authenticated || !data.user) {
          router.replace("/auth");
          return;
        }

        setUser(data.user);
      } catch {
        router.replace("/auth");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [router]);

  if (isLoading || !user) {
    return (
      <main
        dir="rtl"
        className={
          "min-h-screen " +
          (isDark
            ? "bg-[#07120c] text-zinc-100"
            : "bg-[#f7faf7] text-zinc-900")
        }
      >
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
          <div className="h-40 animate-pulse rounded-3xl bg-emerald-700/10" />
        </div>
      </main>
    );
  }

  const accountLabel =
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "\u06a9\u0627\u0631\u0628\u0631 \u0627\u067e\u200c\u062e\u0648\u0631";

  return (
    <main
      dir="rtl"
      className={
        "min-h-screen transition-colors " +
        (isDark
          ? "bg-[#07120c] text-zinc-100"
          : "bg-[#f7faf7] text-[#17211a]")
      }
    >
      <header
        className={
          "border-b " +
          (isDark
            ? "border-white/10 bg-[#07120c]"
            : "border-emerald-950/10 bg-white")
        }
      >
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-black text-white">
              {"\u0627"}
            </span>

            <div>
              <strong className="block text-xl font-black">
                {"\u0627\u067e\u200c\u062e\u0648\u0631"}
              </strong>

              <span className="text-xs text-zinc-500">
                {"\u062d\u0633\u0627\u0628 \u06a9\u0627\u0631\u0628\u0631\u06cc"}
              </span>
            </div>
          </Link>

          <AuthButton />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-8">
          <p className="text-sm font-bold text-emerald-600">
            {"\u062d\u0633\u0627\u0628 \u0645\u0646"}
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {accountLabel}
          </h1>

          <p
            className={
              "mt-3 text-sm leading-7 " +
              (isDark
                ? "text-zinc-400"
                : "text-zinc-600")
            }
          >
            {"\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u067e\u0627\u06cc\u0647 \u062d\u0633\u0627\u0628 \u06a9\u0627\u0631\u0628\u0631\u06cc \u0634\u0645\u0627 \u062f\u0631 \u0627\u067e\u200c\u062e\u0648\u0631."}
          </p>
        </div>

        <section
          className={
            "overflow-hidden rounded-3xl border " +
            (isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-emerald-100 bg-white")
          }
        >
          <div className="flex flex-col gap-5 border-b border-inherit p-6 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-700 text-2xl font-black text-white">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                accountLabel.slice(0, 1)
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xl font-black">
                {accountLabel}
              </p>

              {user.email && (
                <p
                  dir="ltr"
                  className="mt-1 truncate text-left text-sm text-zinc-500"
                >
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <dl className="grid sm:grid-cols-2">
            <div className="border-b border-inherit p-6 sm:border-l">
              <dt className="text-xs font-bold text-zinc-500">
                {"\u0646\u0642\u0634 \u062d\u0633\u0627\u0628"}
              </dt>

              <dd className="mt-2 font-black">
                {roleLabel(user.role)}
              </dd>
            </div>

            <div className="border-b border-inherit p-6">
              <dt className="text-xs font-bold text-zinc-500">
                {"\u0648\u0636\u0639\u06cc\u062a \u0627\u06cc\u0645\u06cc\u0644"}
              </dt>

              <dd className="mt-2">
                <span
                  className={
                    "inline-flex rounded-full px-3 py-1 text-xs font-black " +
                    (user.emailVerified
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-amber-500/15 text-amber-600")
                  }
                >
                  {user.emailVerified
                    ? "\u062a\u0623\u06cc\u06cc\u062f \u0634\u062f\u0647"
                    : "\u062a\u0623\u06cc\u06cc\u062f \u0646\u0634\u062f\u0647"}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section
          className={
            "mt-6 rounded-3xl border p-6 " +
            (isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-emerald-100 bg-white")
          }
        >
          <h2 className="text-lg font-black">
            {"\u0627\u0645\u0646\u06cc\u062a \u062d\u0633\u0627\u0628"}
          </h2>

          <p className="mt-2 text-sm leading-7 text-zinc-500">
            {"\u0628\u0631\u0627\u06cc \u062a\u063a\u06cc\u06cc\u0631 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631\u060c \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0627\u0632 \u0641\u0631\u0622\u06cc\u0646\u062f \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06cc \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u06a9\u0646\u06cc\u062f."}
          </p>

          <Link
            href="/auth/forgot-password"
            className="mt-4 inline-flex rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700/40 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          >
            {"\u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06cc \u0631\u0645\u0632 \u0639\u0628\u0648\u0631"}
          </Link>
        </section>
      </div>
    </main>
  );
}
