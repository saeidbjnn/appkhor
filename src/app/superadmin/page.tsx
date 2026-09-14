import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminDashboard from "./superadmin-dashboard";
import SuperadminLogin from "./superadmin-login";

type DashboardStatsRow = {
  apps: number;
  published_apps: number;
  draft_apps: number;
  categories: number;
  platforms: number;
  users: number;
  active_users: number;
  active_links: number;
  outbound_clicks: number;
  clicks_today: number;
  media_assets: number;
  orphan_media_assets: number;
};

export type SuperadminStats = {
  apps: number;
  publishedApps: number;
  draftApps: number;
  categories: number;
  platforms: number;
  users: number;
  activeUsers: number;
  activeLinks: number;
  outboundClicks: number;
  clicksToday: number;
  mediaAssets: number;
  orphanMediaAssets: number;
};

async function getDashboardStats(): Promise<SuperadminStats> {
  const { env } = getCloudflareContext();

  const row = await env.appkhor_db
    .prepare(
      `SELECT
        (
          SELECT COUNT(*)
          FROM apps
        ) AS apps,

        (
          SELECT COUNT(*)
          FROM apps
          WHERE status = 'PUBLISHED'
        ) AS published_apps,

        (
          SELECT COUNT(*)
          FROM apps
          WHERE status = 'DRAFT'
        ) AS draft_apps,

        (
          SELECT COUNT(*)
          FROM categories
        ) AS categories,

        (
          SELECT COUNT(*)
          FROM platforms
        ) AS platforms,

        (
          SELECT COUNT(*)
          FROM users
          WHERE account_status <> 'DELETED'
        ) AS users,

        (
          SELECT COUNT(*)
          FROM users
          WHERE account_status = 'ACTIVE'
        ) AS active_users,

        (
          SELECT COUNT(*)
          FROM app_links
          WHERE is_active = 1
        ) AS active_links,

        (
          SELECT COUNT(*)
          FROM outbound_clicks
        ) AS outbound_clicks,

        (
          SELECT COUNT(*)
          FROM outbound_clicks
          WHERE created_at >= datetime(
            'now',
            'start of day'
          )
        ) AS clicks_today,

        (
          SELECT COUNT(*)
          FROM media_assets
        ) AS media_assets,

        (
          SELECT COUNT(*)
          FROM media_assets m
          WHERE NOT EXISTS (
            SELECT 1
            FROM apps a
            WHERE a.logo_url LIKE
              '%/media/' || m.id
          )
          AND NOT EXISTS (
            SELECT 1
            FROM app_screenshots s
            WHERE s.image_url LIKE
              '%/media/' || m.id
          )
        ) AS orphan_media_assets`,
    )
    .first<DashboardStatsRow>();

  return {
    apps: Number(row?.apps ?? 0),
    publishedApps: Number(
      row?.published_apps ?? 0,
    ),
    draftApps: Number(
      row?.draft_apps ?? 0,
    ),
    categories: Number(
      row?.categories ?? 0,
    ),
    platforms: Number(
      row?.platforms ?? 0,
    ),
    users: Number(
      row?.users ?? 0,
    ),
    activeUsers: Number(
      row?.active_users ?? 0,
    ),
    activeLinks: Number(
      row?.active_links ?? 0,
    ),
    outboundClicks: Number(
      row?.outbound_clicks ?? 0,
    ),
    clicksToday: Number(
      row?.clicks_today ?? 0,
    ),
    mediaAssets: Number(
      row?.media_assets ?? 0,
    ),
    orphanMediaAssets: Number(
      row?.orphan_media_assets ?? 0,
    ),
  };
}

export default async function SuperadminPage() {
  const session =
    await getSuperadminSession();

  if (!session) {
    return <SuperadminLogin />;
  }

  const stats =
    await getDashboardStats();

  return (
    <SuperadminDashboard
      email={session.email}
      stats={stats}
    />
  );
}
