import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminLinksClient from "./superadmin-links-client";

export type SuperadminLinkRow = {
  id: string;
  appId: string;
  appSlug: string;
  appName: string;
  appNameFa: string | null;
  platformId: string | null;
  platformNameFa: string | null;
  platformSlug: string | null;
  labelFa: string;
  url: string;
  linkType:
    | "DOWNLOAD"
    | "RUN"
    | "WEBSITE"
    | "SOURCE"
    | "DOCS"
    | "STORE"
    | "OTHER";
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  clickCount: number;
};

type LinkRow = {
  id: string;
  app_id: string;
  app_slug: string;
  app_name: string;
  app_name_fa: string | null;
  platform_id: string | null;
  platform_name_fa: string | null;
  platform_slug: string | null;
  label_fa: string;
  url: string;
  link_type: SuperadminLinkRow["linkType"];
  is_primary: number;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  click_count: number;
};

export default async function SuperadminLinksPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const result = await env.appkhor_db
    .prepare(
      `SELECT
        l.id,
        l.app_id,
        a.slug AS app_slug,
        a.name AS app_name,
        a.name_fa AS app_name_fa,
        l.platform_id,
        p.name_fa AS platform_name_fa,
        p.slug AS platform_slug,
        l.label_fa,
        l.url,
        l.link_type,
        l.is_primary,
        l.is_active,
        l.sort_order,
        l.created_at,
        l.updated_at,
        (
          SELECT COUNT(*)
          FROM outbound_clicks oc
          WHERE oc.link_id = l.id
        ) AS click_count
      FROM app_links l
      INNER JOIN apps a
        ON a.id = l.app_id
      LEFT JOIN platforms p
        ON p.id = l.platform_id
      ORDER BY
        COALESCE(a.name_fa, a.name) ASC,
        l.sort_order ASC,
        l.created_at ASC`,
    )
    .all<LinkRow>();

  const links: SuperadminLinkRow[] =
    (result.results ?? []).map((link) => ({
      id: link.id,
      appId: link.app_id,
      appSlug: link.app_slug,
      appName: link.app_name,
      appNameFa: link.app_name_fa,
      platformId: link.platform_id,
      platformNameFa: link.platform_name_fa,
      platformSlug: link.platform_slug,
      labelFa: link.label_fa,
      url: link.url,
      linkType: link.link_type,
      isPrimary: link.is_primary === 1,
      isActive: link.is_active === 1,
      sortOrder: link.sort_order,
      createdAt: link.created_at,
      updatedAt: link.updated_at,
      clickCount: Number(link.click_count ?? 0),
    }));

  return (
    <SuperadminLinksClient
      email={session.email}
      links={links}
    />
  );
}
