import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminPlatformsClient from "./superadmin-platforms-client";

export type SuperadminPlatformRow = {
  id: string;
  slug: string;
  nameFa: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  appCount: number;
  createdAt: string;
  updatedAt: string;
};

type PlatformRow = {
  id: string;
  slug: string;
  name_fa: string;
  icon: string | null;
  sort_order: number;
  is_active: number;
  app_count: number;
  created_at: string;
  updated_at: string;
};

export default async function SuperadminPlatformsPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const result = await env.appkhor_db
    .prepare(
      `SELECT
        p.id,
        p.slug,
        p.name_fa,
        p.icon,
        p.sort_order,
        p.is_active,
        p.created_at,
        p.updated_at,
        COUNT(ap.app_id) AS app_count
      FROM platforms p
      LEFT JOIN app_platforms ap
        ON ap.platform_id = p.id
      GROUP BY p.id
      ORDER BY
        p.sort_order ASC,
        p.name_fa ASC`,
    )
    .all<PlatformRow>();

  const platforms: SuperadminPlatformRow[] =
    (result.results ?? []).map((platform) => ({
      id: platform.id,
      slug: platform.slug,
      nameFa: platform.name_fa,
      icon: platform.icon,
      sortOrder: platform.sort_order,
      isActive: platform.is_active === 1,
      appCount: Number(platform.app_count ?? 0),
      createdAt: platform.created_at,
      updatedAt: platform.updated_at,
    }));

  return (
    <SuperadminPlatformsClient
      email={session.email}
      platforms={platforms}
    />
  );
}
