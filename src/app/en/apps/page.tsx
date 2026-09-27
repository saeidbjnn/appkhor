import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apps",
  description:
    "Browse useful apps and open-source tools with links to official sources.",
  alternates: {
    canonical: "/en/apps",
    languages: {
      "fa-IR": "/apps",
      en: "/en/apps",
    },
  },
};

type AppRow = {
  slug: string;
  name: string;
  description: string;
  logo_url: string | null;
  category_name: string | null;
};

type PageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function EnglishAppsPage({
  searchParams,
}: PageProps) {
  const { env } = getCloudflareContext();

  const params = await searchParams;

  const rawQuery = Array.isArray(params.q)
    ? params.q[0]
    : params.q;

  const query =
    rawQuery?.trim().slice(0, 100) ?? "";

  const searchPattern = `%${query}%`;

  let statement = env.appkhor_db.prepare(`
    SELECT
      apps.slug,
      apps.name,
      COALESCE(
        apps.short_description_en,
        apps.short_description_fa
      ) AS description,
      apps.logo_url,
      (
        SELECT COALESCE(
          categories.name_en,
          categories.name_fa
        )
        FROM app_categories
        INNER JOIN categories
          ON categories.id =
            app_categories.category_id
        WHERE app_categories.app_id =
          apps.id
          AND categories.is_active = 1
        ORDER BY
          categories.sort_order,
          categories.name_fa
        LIMIT 1
      ) AS category_name
    FROM apps
    WHERE apps.status = 'PUBLISHED'
      ${
        query
          ? `AND (
              apps.name LIKE ?
                COLLATE NOCASE
              OR COALESCE(
                apps.short_description_en,
                apps.short_description_fa
              ) LIKE ?
              OR apps.slug LIKE ?
                COLLATE NOCASE
            )`
          : ""
      }
    ORDER BY
      apps.is_featured DESC,
      CASE
        WHEN apps.published_at IS NULL
        THEN 1
        ELSE 0
      END,
      apps.published_at DESC,
      apps.created_at DESC
  `);

  if (query) {
    statement = statement.bind(
      searchPattern,
      searchPattern,
      searchPattern,
    );
  }

  const result =
    await statement.all<AppRow>();

  const apps = result.results ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                AppKhor
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Browse apps
              </h1>
            </div>

            <Link
              href="/apps"
              className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              فارسی
            </Link>
          </div>

          <p className="max-w-2xl text-muted-foreground">
            Discover useful software and open-source tools
            with direct links to official sources.
          </p>

          <form
            action="/en/apps"
            method="get"
            className="flex max-w-xl gap-2"
          >
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search apps..."
              className="min-w-0 flex-1 rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-500"
            >
              Search
            </button>
          </form>
        </header>

        <div className="text-sm text-muted-foreground">
          {apps.length.toLocaleString("en-US")}{" "}
          {apps.length === 1 ? "app" : "apps"}
        </div>

        {apps.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <Link
                key={app.slug}
                href={`/en/apps/${app.slug}`}
                className="rounded-2xl border bg-card p-5 transition hover:border-emerald-500/50 hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt=""
                        className="h-12 w-12 rounded-xl object-contain"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted font-bold">
                        {app.name
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">
                        {app.name}
                      </h2>

                      {app.category_name ? (
                        <p className="text-sm text-muted-foreground">
                          {app.category_name}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {app.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border p-8 text-center text-muted-foreground">
            No apps found.
          </div>
        )}
      </div>
    </main>
  );
}
