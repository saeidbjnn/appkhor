import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminCategoriesClient from "./superadmin-categories-client";

export type SuperadminCategoryRow = {
  id: string;
  slug: string;
  nameFa: string;
  descriptionFa: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  appCount: number;
  createdAt: string;
  updatedAt: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_fa: string;
  description_fa: string | null;
  icon: string | null;
  sort_order: number;
  is_active: number;
  app_count: number;
  created_at: string;
  updated_at: string;
};

export default async function SuperadminCategoriesPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const result = await env.appkhor_db
    .prepare(
      `SELECT
        c.id,
        c.slug,
        c.name_fa,
        c.description_fa,
        c.icon,
        c.sort_order,
        c.is_active,
        c.created_at,
        c.updated_at,
        COUNT(ac.app_id) AS app_count
      FROM categories c
      LEFT JOIN app_categories ac
        ON ac.category_id = c.id
      GROUP BY c.id
      ORDER BY
        c.sort_order ASC,
        c.name_fa ASC`,
    )
    .all<CategoryRow>();

  const categories: SuperadminCategoryRow[] =
    (result.results ?? []).map((category) => ({
      id: category.id,
      slug: category.slug,
      nameFa: category.name_fa,
      descriptionFa: category.description_fa,
      icon: category.icon,
      sortOrder: category.sort_order,
      isActive: category.is_active === 1,
      appCount: Number(category.app_count ?? 0),
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    }));

  return (
    <SuperadminCategoriesClient
      email={session.email}
      categories={categories}
    />
  );
}
