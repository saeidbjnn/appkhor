import { getCloudflareContext } from "@opennextjs/cloudflare";
import HomeClient from "./home-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AppRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  logo_url: string | null;
  developer_name: string | null;
  license_name: string | null;
  is_featured: number;
  published_at: string | null;
  category_name_fa: string | null;
  platform_count: number;
  click_count: number;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_fa: string;
  icon: string | null;
  app_count: number;
};

type StatsRow = {
  published_apps: number;
  outbound_clicks: number;
  active_categories: number;
};

export type HomeApp = {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  description: string;
  logoUrl: string | null;
  developerName: string | null;
  licenseName: string | null;
  featured: boolean;
  publishedAt: string | null;
  category: string | null;
  platformCount: number;
  clickCount: number;
};

export type HomeCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  appCount: number;
};

export type HomeStats = {
  publishedApps: number;
  outboundClicks: number;
  activeCategories: number;
};

function mapApp(row: AppRow): HomeApp {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameFa: row.name_fa,
    description: row.short_description_fa,
    logoUrl: row.logo_url,
    developerName: row.developer_name,
    licenseName: row.license_name,
    featured: row.is_featured === 1,
    publishedAt: row.published_at,
    category: row.category_name_fa,
    platformCount: Number(row.platform_count ?? 0),
    clickCount: Number(row.click_count ?? 0),
  };
}

export default async function Home() {
  const { env } = getCloudflareContext();

  const [latestResult, popularResult, categoriesResult, statsResult] =
    await Promise.all([
      env.appkhor_db
        .prepare(
          `SELECT
            apps.id,
            apps.slug,
            apps.name,
            apps.name_fa,
            apps.short_description_fa,
            apps.logo_url,
            apps.developer_name,
            apps.license_name,
            apps.is_featured,
            apps.published_at,
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
              SELECT COUNT(*)
              FROM app_platforms
              INNER JOIN platforms
                ON platforms.id = app_platforms.platform_id
              WHERE app_platforms.app_id = apps.id
                AND platforms.is_active = 1
            ) AS platform_count,
            (
              SELECT COUNT(*)
              FROM app_links
              INNER JOIN outbound_clicks
                ON outbound_clicks.link_id = app_links.id
              WHERE app_links.app_id = apps.id
            ) AS click_count
          FROM apps
          WHERE apps.status = 'PUBLISHED'
          ORDER BY
            CASE WHEN apps.published_at IS NULL THEN 1 ELSE 0 END,
            apps.published_at DESC,
            apps.created_at DESC
          LIMIT 3`,
        )
        .all<AppRow>(),

      env.appkhor_db
        .prepare(
          `SELECT
            apps.id,
            apps.slug,
            apps.name,
            apps.name_fa,
            apps.short_description_fa,
            apps.logo_url,
            apps.developer_name,
            apps.license_name,
            apps.is_featured,
            apps.published_at,
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
              SELECT COUNT(*)
              FROM app_platforms
              INNER JOIN platforms
                ON platforms.id = app_platforms.platform_id
              WHERE app_platforms.app_id = apps.id
                AND platforms.is_active = 1
            ) AS platform_count,
            (
              SELECT COUNT(*)
              FROM app_links
              INNER JOIN outbound_clicks
                ON outbound_clicks.link_id = app_links.id
              WHERE app_links.app_id = apps.id
                AND outbound_clicks.created_at >= datetime('now', '-7 days')
            ) AS click_count
          FROM apps
          WHERE apps.status = 'PUBLISHED'
          ORDER BY click_count DESC,
            apps.is_featured DESC,
            CASE WHEN apps.published_at IS NULL THEN 1 ELSE 0 END,
            apps.published_at DESC,
            apps.created_at DESC
          LIMIT 3`,
        )
        .all<AppRow>(),

      env.appkhor_db
        .prepare(
          `SELECT
            categories.id,
            categories.slug,
            categories.name_fa,
            categories.icon,
            COUNT(DISTINCT apps.id) AS app_count
          FROM categories
          LEFT JOIN app_categories
            ON app_categories.category_id = categories.id
          LEFT JOIN apps
            ON apps.id = app_categories.app_id
            AND apps.status = 'PUBLISHED'
          WHERE categories.is_active = 1
          GROUP BY
            categories.id,
            categories.slug,
            categories.name_fa,
            categories.icon,
            categories.sort_order
          ORDER BY app_count DESC, categories.sort_order, categories.name_fa
          LIMIT 4`,
        )
        .all<CategoryRow>(),

      env.appkhor_db
        .prepare(
          `SELECT
            (SELECT COUNT(*) FROM apps WHERE status = 'PUBLISHED') AS published_apps,
            (SELECT COUNT(*) FROM outbound_clicks) AS outbound_clicks,
            (SELECT COUNT(*) FROM categories WHERE is_active = 1) AS active_categories`,
        )
        .first<StatsRow>(),
    ]);

  const latestApps = (latestResult.results ?? []).map(mapApp);
  const popularApps = (popularResult.results ?? []).map(mapApp);

  const categories: HomeCategory[] = (categoriesResult.results ?? []).map(
    (row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name_fa,
      icon: row.icon,
      appCount: Number(row.app_count ?? 0),
    }),
  );

  const stats: HomeStats = {
    publishedApps: Number(statsResult?.published_apps ?? 0),
    outboundClicks: Number(statsResult?.outbound_clicks ?? 0),
    activeCategories: Number(statsResult?.active_categories ?? 0),
  };

  return (
    <HomeClient
      latestApps={latestApps}
      popularApps={popularApps}
      categories={categories}
      stats={stats}
    />
  );
}