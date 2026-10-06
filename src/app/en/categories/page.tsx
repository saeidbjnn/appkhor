import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import CategoriesClient from "../../categories/categories-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse useful apps and open-source tools by category on AppKhor.",
  alternates: {
    canonical: "/en/categories",
    languages: {
      "fa-IR": "/categories",
      en: "/en/categories",
    },
  },
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string | null;
  category_id: string;
  published_at: string | null;
};

type CategoryData = {
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

export default async function EnglishCategoriesPage() {
  const { env } = getCloudflareContext();

  const [categoriesResult, appsResult] = await Promise.all([
    env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          COALESCE(name_en, name_fa) AS name,
          COALESCE(description_en, description_fa) AS description,
          icon,
          sort_order
        FROM categories
        WHERE is_active = 1
        ORDER BY sort_order, name`,
      )
      .all<CategoryRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          apps.id,
          apps.slug,
          apps.name,
          COALESCE(
            apps.short_description_en,
            apps.short_description_fa
          ) AS description,
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
          CASE
            WHEN apps.published_at IS NULL THEN 1
            ELSE 0
          END,
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
    name: category.name,
    subtitle:
      category.description ??
      "Browse the apps in this category and find the right tool for you.",
    icon: category.icon,
    apps: apps
      .filter((app) => app.category_id === category.id)
      .map((app) => ({
        id: app.id,
        slug: app.slug,
        name: app.name,
        nameFa: null,
        description: app.description,
        logoUrl: app.logo_url,
        publishedAt: app.published_at,
      })),
  }));

  return (
    <CategoriesClient
      categories={data}
      locale="en"
    />
  );
}