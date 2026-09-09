import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound, redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminAppForm, {
  type AppFormValues,
  type CategoryOption,
  type PlatformOption,
} from "../../superadmin-app-form";

type AppRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  description_fa: string | null;
  logo_url: string | null;
  website_url: string | null;
  repository_url: string | null;
  developer_name: string | null;
  license_name: string | null;
  search_keywords: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  is_featured: number;
  sort_order: number;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_fa: string;
};

type PlatformRow = {
  id: string;
  slug: string;
  name_fa: string;
};

type SelectedIdRow = {
  id: string;
};

type LinkRow = {
  platform_id: string | null;
  label_fa: string;
  url: string;
  link_type:
    | "DOWNLOAD"
    | "RUN"
    | "WEBSITE"
    | "SOURCE"
    | "DOCS"
    | "STORE"
    | "OTHER";
  is_primary: number;
  sort_order: number;
};

type ScreenshotRow = {
  image_url: string;
  title_fa: string | null;
  alt_fa: string | null;
  sort_order: number;
  is_active: number;
};

export default async function EditSuperadminAppPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { id } = await params;
  const { env } = getCloudflareContext();

  const [
    app,
    categoriesResult,
    platformsResult,
    selectedCategoriesResult,
    selectedPlatformsResult,
    linksResult,
    screenshotsResult,
  ] = await Promise.all([
    env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          name,
          name_fa,
          short_description_fa,
          description_fa,
          logo_url,
          website_url,
          repository_url,
          developer_name,
          license_name,
          search_keywords,
          status,
          is_featured,
          sort_order
        FROM apps
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(id)
      .first<AppRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          name_fa
        FROM categories
        ORDER BY sort_order ASC, name_fa ASC`,
      )
      .all<CategoryRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          name_fa
        FROM platforms
        ORDER BY sort_order ASC, name_fa ASC`,
      )
      .all<PlatformRow>(),

    env.appkhor_db
      .prepare(
        `SELECT category_id AS id
        FROM app_categories
        WHERE app_id = ?`,
      )
      .bind(id)
      .all<SelectedIdRow>(),

    env.appkhor_db
      .prepare(
        `SELECT platform_id AS id
        FROM app_platforms
        WHERE app_id = ?`,
      )
      .bind(id)
      .all<SelectedIdRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          platform_id,
          label_fa,
          url,
          link_type,
          is_primary,
          sort_order
        FROM app_links
        WHERE app_id = ?
          AND is_active = 1
        ORDER BY sort_order ASC, created_at ASC`,
      )
      .bind(id)
      .all<LinkRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          image_url,
          title_fa,
          alt_fa,
          sort_order,
          is_active
        FROM app_screenshots
        WHERE app_id = ?
        ORDER BY sort_order ASC, created_at ASC`,
      )
      .bind(id)
      .all<ScreenshotRow>(),
  ]);

  if (!app) {
    notFound();
  }

  const categories: CategoryOption[] = (
    categoriesResult.results ?? []
  ).map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name_fa,
  }));

  const platforms: PlatformOption[] = (
    platformsResult.results ?? []
  ).map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name_fa,
  }));

  const initialData: AppFormValues = {
    name: app.name,
    nameFa: app.name_fa ?? undefined,
    slug: app.slug,
    shortDescriptionFa: app.short_description_fa,
    descriptionFa: app.description_fa ?? undefined,

    logoUrl: app.logo_url ?? undefined,
    websiteUrl: app.website_url ?? undefined,
    repositoryUrl: app.repository_url ?? undefined,

    developerName: app.developer_name ?? undefined,
    licenseName: app.license_name ?? undefined,
    searchKeywords: app.search_keywords ?? undefined,

    categoryIds: (selectedCategoriesResult.results ?? []).map(
      (item) => item.id,
    ),

    platformIds: (selectedPlatformsResult.results ?? []).map(
      (item) => item.id,
    ),

    links: (linksResult.results ?? []).map((item) => ({
      platformId: item.platform_id ?? undefined,
      labelFa: item.label_fa,
      url: item.url,
      linkType: item.link_type,
      isPrimary: item.is_primary === 1,
      sortOrder: item.sort_order,
    })),

    screenshots: (screenshotsResult.results ?? []).map((item) => ({
      imageUrl: item.image_url,
      titleFa: item.title_fa ?? undefined,
      altFa: item.alt_fa ?? undefined,
      sortOrder: item.sort_order,
      isActive: item.is_active === 1,
    })),

    status: app.status,
    isFeatured: app.is_featured === 1,
    sortOrder: app.sort_order,
  };

  return (
    <SuperadminAppForm
      mode="edit"
      email={session.email}
      categories={categories}
      platforms={platforms}
      appId={app.id}
      initialData={initialData}
    />
  );
}
