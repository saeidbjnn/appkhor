import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import AppsClient from "../../apps/apps-client";
import type {
  CatalogApp,
  CatalogFacet,
} from "../../apps/page";

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
  openGraph: {
    locale: "en_US",
    url: "/en/apps",
  },
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string | null;
  category_name: string | null;
  primary_link_id: string | null;
  published_at: string | null;
  is_featured: number;
  click_count: number;
};

type RelationRow = {
  app_id: string;
  id: string;
  slug: string;
  name: string;
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

  const sql = `
    SELECT
      apps.id,
      apps.slug,
      apps.name,

      COALESCE(
        apps.short_description_en,
        apps.short_description_fa
      ) AS description,

      apps.logo_url,
      apps.published_at,
      apps.is_featured,

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
      ) AS category_name,

      (
        SELECT app_links.id
        FROM app_links
        WHERE app_links.app_id = apps.id
          AND app_links.is_active = 1
        ORDER BY
          app_links.is_primary DESC,
          app_links.sort_order,
          app_links.created_at
        LIMIT 1
      ) AS primary_link_id,

      (
        SELECT COUNT(*)
        FROM app_links
        INNER JOIN outbound_clicks
          ON outbound_clicks.link_id =
            app_links.id
        WHERE app_links.app_id = apps.id
      ) AS click_count

    FROM apps

    WHERE apps.status = 'PUBLISHED'

      ${
        query
          ? `AND (
              apps.name LIKE ?
                COLLATE NOCASE

              OR apps.slug LIKE ?
                COLLATE NOCASE

              OR COALESCE(
                apps.short_description_en,
                apps.short_description_fa
              ) LIKE ?

              OR COALESCE(
                apps.description_en,
                apps.description_fa,
                ''
              ) LIKE ?

              OR COALESCE(
                apps.developer_name,
                ''
              ) LIKE ?
                COLLATE NOCASE

              OR EXISTS (
                SELECT 1
                FROM app_categories
                  search_app_categories

                INNER JOIN categories
                  search_categories
                  ON search_categories.id =
                    search_app_categories.category_id

                WHERE
                  search_app_categories.app_id =
                    apps.id

                  AND
                    search_categories.is_active = 1

                  AND COALESCE(
                    search_categories.name_en,
                    search_categories.name_fa
                  ) LIKE ?
              )
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
  `;

  let statement =
    env.appkhor_db.prepare(sql);

  if (query) {
    statement = statement.bind(
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    );
  }

  const [
    appsResult,
    categoryRelationsResult,
    platformRelationsResult,
  ] = await Promise.all([
    statement.all<AppRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          app_categories.app_id,
          categories.id,
          categories.slug,
          COALESCE(
            categories.name_en,
            categories.name_fa
          ) AS name

        FROM app_categories

        INNER JOIN categories
          ON categories.id =
            app_categories.category_id

        INNER JOIN apps
          ON apps.id =
            app_categories.app_id

        WHERE categories.is_active = 1
          AND apps.status = 'PUBLISHED'

        ORDER BY
          categories.sort_order,
          categories.name_fa`,
      )
      .all<RelationRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          app_platforms.app_id,
          platforms.id,
          platforms.slug,
          COALESCE(
            platforms.name_en,
            platforms.name_fa
          ) AS name

        FROM app_platforms

        INNER JOIN platforms
          ON platforms.id =
            app_platforms.platform_id

        INNER JOIN apps
          ON apps.id =
            app_platforms.app_id

        WHERE platforms.is_active = 1
          AND apps.status = 'PUBLISHED'

        ORDER BY
          platforms.sort_order,
          platforms.name_fa`,
      )
      .all<RelationRow>(),
  ]);

  const categoryMap =
    new Map<string, CatalogFacet[]>();

  for (
    const row of
    categoryRelationsResult.results ?? []
  ) {
    const current =
      categoryMap.get(row.app_id) ?? [];

    current.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
    });

    categoryMap.set(
      row.app_id,
      current,
    );
  }

  const platformMap =
    new Map<string, CatalogFacet[]>();

  for (
    const row of
    platformRelationsResult.results ?? []
  ) {
    const current =
      platformMap.get(row.app_id) ?? [];

    current.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
    });

    platformMap.set(
      row.app_id,
      current,
    );
  }

  const apps: CatalogApp[] =
    (appsResult.results ?? []).map(
      (row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        nameFa: null,
        description: row.description,
        logoUrl: row.logo_url,
        category: row.category_name,
        categories:
          categoryMap.get(row.id) ?? [],
        platforms:
          platformMap.get(row.id) ?? [],
        primaryLinkId:
          row.primary_link_id,
        publishedAt:
          row.published_at,
        featured:
          row.is_featured === 1,
        clickCount:
          Number(row.click_count ?? 0),
      }),
    );

  return (
    <AppsClient
      apps={apps}
      initialQuery={query}
      locale="en"
    />
  );
}