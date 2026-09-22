import { getCloudflareContext } from "@opennextjs/cloudflare";
import AppsClient from "./apps-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type CatalogFacet = {
  id: string;
  slug: string;
  name: string;
};

export type CatalogApp = {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  description: string;
  logoUrl: string | null;
  category: string | null;
  categories: CatalogFacet[];
  platforms: CatalogFacet[];
  primaryLinkId: string | null;
  publishedAt: string | null;
  featured: boolean;
  clickCount: number;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  logo_url: string | null;
  category_name_fa: string | null;
  primary_link_id: string | null;
  published_at: string | null;
  is_featured: number;
  click_count: number;
};

type RelationRow = {
  app_id: string;
  id: string;
  slug: string;
  name_fa: string;
};

type AppsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function AppsPage({
  searchParams,
}: AppsPageProps) {
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
      apps.name_fa,
      apps.short_description_fa,
      apps.logo_url,
      apps.published_at,
      apps.is_featured,

      (
        SELECT categories.name_fa
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
      ) AS category_name_fa,

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

              OR COALESCE(
                apps.name_fa,
                ''
              ) LIKE ?

              OR apps.slug LIKE ?
                COLLATE NOCASE

              OR apps.short_description_fa
                LIKE ?

              OR COALESCE(
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

                  AND
                    search_categories.name_fa
                      LIKE ?
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
          categories.name_fa

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
          platforms.name_fa

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
      name: row.name_fa,
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
      name: row.name_fa,
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
        nameFa: row.name_fa,
        description:
          row.short_description_fa,
        logoUrl: row.logo_url,
        category:
          row.category_name_fa,
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
    />
  );
}
