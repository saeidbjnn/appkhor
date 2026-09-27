import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string | null;
  website_url: string | null;
  repository_url: string | null;
  developer_name: string | null;
  license_name: string | null;
};

type LinkRow = {
  id: string;
  label: string;
  link_type: string;
  is_primary: number;
  platform_name: string | null;
};

async function getApp(slug: string) {
  const { env } = getCloudflareContext();

  return env.appkhor_db
    .prepare(
      `SELECT
        id,
        slug,
        name,
        COALESCE(
          description_en,
          description_fa,
          short_description_en,
          short_description_fa
        ) AS description,
        logo_url,
        website_url,
        repository_url,
        developer_name,
        license_name
      FROM apps
      WHERE slug = ?
        AND status = 'PUBLISHED'
      LIMIT 1`,
    )
    .bind(slug)
    .first<AppRow>();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = await getApp(slug);

  if (!app) {
    return {};
  }

  const canonical =
    "/en/apps/" +
    encodeURIComponent(app.slug);

  const faCanonical =
    "/apps/" +
    encodeURIComponent(app.slug);

  return {
    title: app.name,
    description: app.description,
    alternates: {
      canonical,
      languages: {
        "fa-IR": faCanonical,
        en: canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      title: app.name + " | AppKhor",
      description: app.description,
      images: app.logo_url
        ? [app.logo_url]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: app.name + " | AppKhor",
      description: app.description,
      images: app.logo_url
        ? [app.logo_url]
        : undefined,
    },
  };
}

export default async function EnglishAppDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const app = await getApp(slug);

  if (!app) {
    notFound();
  }

  const { env } = getCloudflareContext();

  const linksResult = await env.appkhor_db
    .prepare(
      `SELECT
        app_links.id,
        COALESCE(
          app_links.label_en,
          app_links.label_fa
        ) AS label,
        app_links.link_type,
        app_links.is_primary,
        COALESCE(
          platforms.name_en,
          platforms.name_fa
        ) AS platform_name
      FROM app_links
      LEFT JOIN platforms
        ON platforms.id =
          app_links.platform_id
      WHERE app_links.app_id = ?
        AND app_links.is_active = 1
      ORDER BY
        app_links.is_primary DESC,
        app_links.sort_order,
        app_links.created_at`,
    )
    .bind(app.id)
    .all<LinkRow>();

  const links =
    linksResult.results ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <div className="space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/en/apps"
            className="text-sm font-medium text-emerald-600 hover:underline"
          >
            ← Back to apps
          </Link>

          <LanguageSwitcher />
        </div>

        <section className="space-y-6">
          <div className="flex items-start gap-5">
            {app.logo_url ? (
              <img
                src={app.logo_url}
                alt=""
                className="h-20 w-20 rounded-2xl object-contain"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-2xl font-bold">
                {app.name
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0 space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                {app.name}
              </h1>

              {app.developer_name ? (
                <p className="text-muted-foreground">
                  by {app.developer_name}
                </p>
              ) : null}
            </div>
          </div>

          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            {app.description}
          </p>

          <div className="flex flex-wrap gap-2 text-sm">
            {app.license_name ? (
              <span className="rounded-full border px-3 py-1">
                License: {app.license_name}
              </span>
            ) : null}

            {app.website_url ? (
              <a
                href={app.website_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-3 py-1 hover:bg-muted"
              >
                Website
              </a>
            ) : null}

            {app.repository_url ? (
              <a
                href={app.repository_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-3 py-1 hover:bg-muted"
              >
                Repository
              </a>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">
              Official links
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              AppKhor redirects you to the official source.
            </p>
          </div>

          {links.length > 0 ? (
            <div className="grid gap-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={`/go/${link.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border p-4 transition hover:border-emerald-500/50 hover:bg-muted/40"
                >
                  <div>
                    <div className="font-medium">
                      {link.label}
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {[
                        link.platform_name,
                        link.link_type,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>

                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border p-6 text-muted-foreground">
              No official links are available yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
