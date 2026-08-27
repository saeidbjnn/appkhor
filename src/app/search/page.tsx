import { getCloudflareContext } from "@opennextjs/cloudflare";
import SearchClient from "./search-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchApp = {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  description: string;
  logoUrl: string | null;
  developerName: string | null;
  category: string | null;
  platforms: string[];
  featured: boolean;
  score: number;
};

type SearchRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  logo_url: string | null;
  developer_name: string | null;
  is_featured: number;
  category_name_fa: string | null;
  score: number;
};

type PlatformRow = {
  app_id: string;
  name_fa: string;
};

type RelationRow = {
  category_id: string | null;
  platform_id: string | null;
};

type SimilarRow = SearchRow & {
  overlap_score: number;
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function normalizeQuery(value: string) {
  return value
    .normalize("NFKC")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { env } = getCloudflareContext();

  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = normalizeQuery(rawQuery ?? "");

  if (!query) {
    return (
      <SearchClient
        query=""
        results={[]}
        similarApps={[]}
      />
    );
  }

  const phrasePattern = `%${query}%`;
  const prefixPattern = `${query}%`;

  const result = await env.appkhor_db
    .prepare(
      `SELECT
        apps.id,
        apps.slug,
        apps.name,
        apps.name_fa,
        apps.short_description_fa,
        apps.logo_url,
        apps.developer_name,
        apps.is_featured,
        (
          SELECT categories.name_fa
          FROM app_categories
          INNER JOIN categories
            ON categories.id = app_categories.category_id
          WHERE app_categories.app_id = apps.id
            AND categories.is_active = 1
          ORDER BY categories.sort_order, categories.name_fa
          LIMIT 1
        ) AS category_name_fa,
        (
          CASE
            WHEN lower(apps.name) = lower(?) THEN 130
            WHEN COALESCE(apps.name_fa, '') = ? THEN 130
            ELSE 0
          END
          +
          CASE
            WHEN apps.name LIKE ? COLLATE NOCASE THEN 95
            WHEN COALESCE(apps.name_fa, '') LIKE ? THEN 95
            ELSE 0
          END
          +
          CASE
            WHEN apps.name LIKE ? COLLATE NOCASE THEN 70
            WHEN COALESCE(apps.name_fa, '') LIKE ? THEN 70
            ELSE 0
          END
          +
          CASE
            WHEN COALESCE(apps.search_keywords, '') LIKE ? COLLATE NOCASE THEN 65
            ELSE 0
          END
          +
          CASE
            WHEN COALESCE(apps.developer_name, '') LIKE ? COLLATE NOCASE THEN 35
            ELSE 0
          END
          +
          CASE
            WHEN apps.short_description_fa LIKE ?
              OR COALESCE(apps.description_fa, '') LIKE ?
            THEN 30
            ELSE 0
          END
          +
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM app_categories search_ac
              INNER JOIN categories search_categories
                ON search_categories.id = search_ac.category_id
              WHERE search_ac.app_id = apps.id
                AND search_categories.is_active = 1
                AND (
                  search_categories.name_fa LIKE ?
                  OR search_categories.slug LIKE ? COLLATE NOCASE
                )
            )
            THEN 45
            ELSE 0
          END
          +
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM app_platforms search_ap
              INNER JOIN platforms search_platforms
                ON search_platforms.id = search_ap.platform_id
              WHERE search_ap.app_id = apps.id
                AND search_platforms.is_active = 1
                AND (
                  search_platforms.name_fa LIKE ?
                  OR search_platforms.slug LIKE ? COLLATE NOCASE
                )
            )
            THEN 35
            ELSE 0
          END
        ) AS score
      FROM apps
      WHERE apps.status = 'PUBLISHED'
        AND (
          apps.name LIKE ? COLLATE NOCASE
          OR COALESCE(apps.name_fa, '') LIKE ?
          OR apps.slug LIKE ? COLLATE NOCASE
          OR COALESCE(apps.search_keywords, '') LIKE ? COLLATE NOCASE
          OR COALESCE(apps.developer_name, '') LIKE ? COLLATE NOCASE
          OR apps.short_description_fa LIKE ?
          OR COALESCE(apps.description_fa, '') LIKE ?
          OR EXISTS (
            SELECT 1
            FROM app_categories filter_ac
            INNER JOIN categories filter_categories
              ON filter_categories.id = filter_ac.category_id
            WHERE filter_ac.app_id = apps.id
              AND filter_categories.is_active = 1
              AND (
                filter_categories.name_fa LIKE ?
                OR filter_categories.slug LIKE ? COLLATE NOCASE
              )
          )
          OR EXISTS (
            SELECT 1
            FROM app_platforms filter_ap
            INNER JOIN platforms filter_platforms
              ON filter_platforms.id = filter_ap.platform_id
            WHERE filter_ap.app_id = apps.id
              AND filter_platforms.is_active = 1
              AND (
                filter_platforms.name_fa LIKE ?
                OR filter_platforms.slug LIKE ? COLLATE NOCASE
              )
          )
        )
      ORDER BY
        score DESC,
        apps.is_featured DESC,
        CASE WHEN apps.published_at IS NULL THEN 1 ELSE 0 END,
        apps.published_at DESC,
        apps.created_at DESC
      LIMIT 12`,
    )
    .bind(
      query,
      query,
      prefixPattern,
      prefixPattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
      phrasePattern,
    )
    .all<SearchRow>();

  const rows = result.results ?? [];
  const resultIds = rows.map((row) => row.id);

  const platformsByApp = new Map<string, string[]>();

  if (resultIds.length > 0) {
    const placeholders = resultIds.map(() => "?").join(",");

    const platformResult = await env.appkhor_db
      .prepare(
        `SELECT
          app_platforms.app_id,
          platforms.name_fa
        FROM app_platforms
        INNER JOIN platforms
          ON platforms.id = app_platforms.platform_id
        WHERE platforms.is_active = 1
          AND app_platforms.app_id IN (${placeholders})
        ORDER BY platforms.sort_order, platforms.name_fa`,
      )
      .bind(...resultIds)
      .all<PlatformRow>();

    for (const row of platformResult.results ?? []) {
      const current = platformsByApp.get(row.app_id) ?? [];
      current.push(row.name_fa);
      platformsByApp.set(row.app_id, current);
    }
  }

  const results: SearchApp[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameFa: row.name_fa,
    description: row.short_description_fa,
    logoUrl: row.logo_url,
    developerName: row.developer_name,
    category: row.category_name_fa,
    platforms: platformsByApp.get(row.id) ?? [],
    featured: row.is_featured === 1,
    score: Number(row.score ?? 0),
  }));

  let similarApps: SearchApp[] = [];

  if (results.length > 0) {
    const topAppId = results[0].id;

    const relations = await env.appkhor_db
      .prepare(
        `SELECT
          app_categories.category_id,
          NULL AS platform_id
        FROM app_categories
        WHERE app_categories.app_id = ?

        UNION ALL

        SELECT
          NULL AS category_id,
          app_platforms.platform_id
        FROM app_platforms
        WHERE app_platforms.app_id = ?`,
      )
      .bind(topAppId, topAppId)
      .all<RelationRow>();

    const categoryIds = (relations.results ?? [])
      .map((row) => row.category_id)
      .filter((value): value is string => Boolean(value));

    const platformIds = (relations.results ?? [])
      .map((row) => row.platform_id)
      .filter((value): value is string => Boolean(value));

    if (categoryIds.length > 0 || platformIds.length > 0) {
      const excludeIds = resultIds.length > 0 ? resultIds : [topAppId];
      const excludePlaceholders = excludeIds.map(() => "?").join(",");

      const categoryPlaceholders =
        categoryIds.length > 0
          ? categoryIds.map(() => "?").join(",")
          : "NULL";

      const platformPlaceholders =
        platformIds.length > 0
          ? platformIds.map(() => "?").join(",")
          : "NULL";

      const similarResult = await env.appkhor_db
        .prepare(
          `SELECT
            apps.id,
            apps.slug,
            apps.name,
            apps.name_fa,
            apps.short_description_fa,
            apps.logo_url,
            apps.developer_name,
            apps.is_featured,
            (
              SELECT categories.name_fa
              FROM app_categories
              INNER JOIN categories
                ON categories.id = app_categories.category_id
              WHERE app_categories.app_id = apps.id
                AND categories.is_active = 1
              ORDER BY categories.sort_order, categories.name_fa
              LIMIT 1
            ) AS category_name_fa,
            0 AS score,
            (
              SELECT COUNT(*)
              FROM app_categories similar_ac
              WHERE similar_ac.app_id = apps.id
                AND similar_ac.category_id IN (${categoryPlaceholders})
            )
            +
            (
              SELECT COUNT(*)
              FROM app_platforms similar_ap
              WHERE similar_ap.app_id = apps.id
                AND similar_ap.platform_id IN (${platformPlaceholders})
            ) AS overlap_score
          FROM apps
          WHERE apps.status = 'PUBLISHED'
            AND apps.id NOT IN (${excludePlaceholders})
            AND (
              EXISTS (
                SELECT 1
                FROM app_categories similar_filter_ac
                WHERE similar_filter_ac.app_id = apps.id
                  AND similar_filter_ac.category_id IN (${categoryPlaceholders})
              )
              OR EXISTS (
                SELECT 1
                FROM app_platforms similar_filter_ap
                WHERE similar_filter_ap.app_id = apps.id
                  AND similar_filter_ap.platform_id IN (${platformPlaceholders})
              )
            )
          ORDER BY
            overlap_score DESC,
            apps.is_featured DESC,
            CASE WHEN apps.published_at IS NULL THEN 1 ELSE 0 END,
            apps.published_at DESC
          LIMIT 6`,
        )
        .bind(
          ...categoryIds,
          ...platformIds,
          ...excludeIds,
          ...categoryIds,
          ...platformIds,
        )
        .all<SimilarRow>();

      const similarRows = similarResult.results ?? [];
      const similarIds = similarRows.map((row) => row.id);
      const similarPlatforms = new Map<string, string[]>();

      if (similarIds.length > 0) {
        const placeholders = similarIds.map(() => "?").join(",");

        const platformResult = await env.appkhor_db
          .prepare(
            `SELECT
              app_platforms.app_id,
              platforms.name_fa
            FROM app_platforms
            INNER JOIN platforms
              ON platforms.id = app_platforms.platform_id
            WHERE platforms.is_active = 1
              AND app_platforms.app_id IN (${placeholders})
            ORDER BY platforms.sort_order, platforms.name_fa`,
          )
          .bind(...similarIds)
          .all<PlatformRow>();

        for (const row of platformResult.results ?? []) {
          const current = similarPlatforms.get(row.app_id) ?? [];
          current.push(row.name_fa);
          similarPlatforms.set(row.app_id, current);
        }
      }

      similarApps = similarRows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        nameFa: row.name_fa,
        description: row.short_description_fa,
        logoUrl: row.logo_url,
        developerName: row.developer_name,
        category: row.category_name_fa,
        platforms: similarPlatforms.get(row.id) ?? [],
        featured: row.is_featured === 1,
        score: Number(row.overlap_score ?? 0),
      }));
    }
  }

  return (
    <SearchClient
      query={query}
      results={results}
      similarApps={similarApps}
    />
  );
}