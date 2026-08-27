import { getCloudflareContext } from "@opennextjs/cloudflare";
import CategoriesClient from "./categories-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  slug: string;
  name_fa: string;
  description_fa: string | null;
  icon: string | null;
  sort_order: number;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  logo_url: string | null;
  category_id: string;
  published_at: string | null;
};

export type CategoryData = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  icon: string | null;
  apps: Array<{
    id: string;
    slug: string;
    name: string;
    nameFa: string | null;
    description: string;
    logoUrl: string | null;
    publishedAt: string | null;
  }>;
};

export default async function CategoriesPage() {
  const { env } = getCloudflareContext();

  const [categoriesResult, appsResult] = await Promise.all([
    env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          name_fa,
          description_fa,
          icon,
          sort_order
        FROM categories
        WHERE is_active = 1
        ORDER BY sort_order, name_fa`,
      )
      .all<CategoryRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          apps.id,
          apps.slug,
          apps.name,
          apps.name_fa,
          apps.short_description_fa,
          apps.logo_url,
          app_categories.category_id,
          apps.published_at
        FROM apps
        INNER JOIN app_categories
          ON app_categories.app_id = apps.id
        INNER JOIN categories
          ON categories.id = app_categories.category_id
        WHERE apps.status = 'PUBLISHED'
          AND categories.is_active = 1
        ORDER BY
          app_categories.category_id,
          CASE WHEN apps.published_at IS NULL THEN 1 ELSE 0 END,
          apps.published_at DESC,
          apps.created_at DESC`,
      )
      .all<AppRow>(),
  ]);

  const categories = categoriesResult.results ?? [];
  const apps = appsResult.results ?? [];

  const data: CategoryData[] = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name_fa,
    subtitle:
      category.description_fa ??
      "اپ‌های این دسته‌بندی را یک‌جا ببین و گزینه مناسب را پیدا کن.",
    icon: category.icon,
    apps: apps
      .filter((app) => app.category_id === category.id)
      .map((app) => ({
        id: app.id,
        slug: app.slug,
        name: app.name,
        nameFa: app.name_fa,
        description: app.short_description_fa,
        logoUrl: app.logo_url,
        publishedAt: app.published_at,
      })),
  }));

  return <CategoriesClient categories={data} />;
}