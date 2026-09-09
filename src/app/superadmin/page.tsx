import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminDashboard from "./superadmin-dashboard";
import SuperadminLogin from "./superadmin-login";

type CountRow = {
  count: number;
};

export type SuperadminStats = {
  apps: number;
  publishedApps: number;
  categories: number;
  outboundClicks: number;
};

async function getDashboardStats(): Promise<SuperadminStats> {
  const { env } = getCloudflareContext();

  const [
    appsRow,
    publishedAppsRow,
    categoriesRow,
    outboundClicksRow,
  ] = await Promise.all([
    env.appkhor_db
      .prepare(
        `SELECT COUNT(*) AS count
        FROM apps`,
      )
      .first<CountRow>(),

    env.appkhor_db
      .prepare(
        `SELECT COUNT(*) AS count
        FROM apps
        WHERE status = 'PUBLISHED'`,
      )
      .first<CountRow>(),

    env.appkhor_db
      .prepare(
        `SELECT COUNT(*) AS count
        FROM categories`,
      )
      .first<CountRow>(),

    env.appkhor_db
      .prepare(
        `SELECT COUNT(*) AS count
        FROM outbound_clicks`,
      )
      .first<CountRow>(),
  ]);

  return {
    apps: Number(appsRow?.count ?? 0),
    publishedApps: Number(publishedAppsRow?.count ?? 0),
    categories: Number(categoriesRow?.count ?? 0),
    outboundClicks: Number(outboundClicksRow?.count ?? 0),
  };
}

export default async function SuperadminPage() {
  const session = await getSuperadminSession();

  if (!session) {
    return <SuperadminLogin />;
  }

  const stats = await getDashboardStats();

  return (
    <SuperadminDashboard
      email={session.email}
      stats={stats}
    />
  );
}
