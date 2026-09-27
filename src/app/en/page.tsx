import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AppKhor",
  description:
    "Discover useful apps and open-source tools with direct links to official sources.",
  alternates: {
    canonical: "/en",
    languages: {
      "fa-IR": "/",
      "en": "/en",
    },
  },
};

export default function EnglishHomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-medium text-emerald-600">
            AppKhor
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Discover useful apps and open-source tools
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Find practical software with direct links to official
            websites, repositories, downloads, and stores.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/en/apps"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-500"
          >
            Browse apps
          </Link>

          <Link
            href="/"
            className="rounded-xl border px-5 py-3 font-medium transition hover:bg-muted"
          >
            فارسی
          </Link>
        </div>
      </div>
    </main>
  );
}
