import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminAppsClient from "./superadmin-apps-client";

export type SuperadminAppRow = {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  shortDescriptionFa: string;
  developerName: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  developer_name: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  is_featured: number;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export default async function SuperadminAppsPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const result = await env.appkhor_db
    .prepare(
      `SELECT
        id,
        slug,
        name,
        name_fa,
        short_description_fa,
        developer_name,
        status,
        is_featured,
        sort_order,
        published_at,
        created_at,
        updated_at
      FROM apps
      ORDER BY
        CASE status
          WHEN 'PUBLISHED' THEN 0
          WHEN 'DRAFT' THEN 1
          ELSE 2
        END,
        sort_order ASC,
        updated_at DESC`,
    )
    .all<AppRow>();

  const apps: SuperadminAppRow[] = (result.results ?? []).map(
    (app) => ({
      id: app.id,
      slug: app.slug,
      name: app.name,
      nameFa: app.name_fa,
      shortDescriptionFa: app.short_description_fa,
      developerName: app.developer_name,
      status: app.status,
      isFeatured: app.is_featured === 1,
      sortOrder: app.sort_order,
      publishedAt: app.published_at,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
    }),
  );

  return (
    <SuperadminAppsClient
      email={session.email}
      apps={apps}
    />
  );
}
