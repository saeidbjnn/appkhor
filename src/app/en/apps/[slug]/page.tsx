import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AppDetailClient from "../../../apps/[slug]/app-detail-client";

import type {
  AppCategory,
  AppDetailData,
  AppHighlight,
  AppOfficialLink,
  AppPlatform,
  AppScreenshot,
  RelatedApp,
} from "../../../apps/[slug]/page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  repository_url: string | null;
  developer_name: string | null;
  license_name: string | null;
  published_at: string | null;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
};

type PlatformRow = {
  slug: string;
  name: string;
};

type AppLinkRow = {
  id: string;
  label: string;
  link_type: string;
  is_primary: number;
  platform_name: string | null;
  platform_slug: string | null;
};

type ScreenshotRow = {
  image_url: string;
  title: string | null;
  alt: string | null;
  sort_order: number;
};

type RelatedRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string | null;
  category_name: string | null;
};

type MetadataRow = {
  slug: string;
  name: string;
  short_description: string;
  logo_url: string | null;
};

function getHighlights(
  app: AppDetailData,
  platforms: AppPlatform[],
): AppHighlight[] {
  const items: AppHighlight[] = [];

  if (platforms.length > 1) {
    items.push({
      title: "Multi-platform",
      description: `Available for ${platforms.length.toLocaleString(
        "en-US",
      )} platforms on AppKhor.`,
      icon: "\u2318",
    });
  }

  if (app.repositoryUrl) {
    items.push({
      title: "Open source",
      description:
        "The project's official source-code repository is available directly from this page.",
      icon: "\u2301",
    });
  }

  items.push({
    title: "Official source",
    description:
      "AppKhor links take you directly to the project's official sources.",
    icon: "\u2197",
  });

  return items;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { env } = getCloudflareContext();

  const row = await env.appkhor_db
    .prepare(
      `SELECT
        slug,
        name,
        COALESCE(
          short_description_en,
          short_description_fa
        ) AS short_description,
        logo_url
      FROM apps
      WHERE slug = ?
        AND status = 'PUBLISHED'
      LIMIT 1`,
    )
    .bind(slug)
    .first<MetadataRow>();

  if (!row) {
    return {};
  }

  const canonical =
    "/en/apps/" +
    encodeURIComponent(row.slug);

  const faCanonical =
    "/apps/" +
    encodeURIComponent(row.slug);

  const images = row.logo_url
    ? [row.logo_url]
    : undefined;

  return {
    title: row.name,
    description: row.short_description,
    alternates: {
      canonical,
      languages: {
        fa: faCanonical,
        en: canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      title: row.name + " | AppKhor",
      description: row.short_description,
      images,
    },
    twitter: {
      card: "summary",
      title: row.name + " | AppKhor",
      description: row.short_description,
      images,
    },
  };
}

export default async function EnglishAppDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const { env } = getCloudflareContext();

  const row = await env.appkhor_db
    .prepare(
      `SELECT
        id,
        slug,
        name,

        COALESCE(
          short_description_en,
          short_description_fa
        ) AS short_description,

        COALESCE(
          description_en,
          description_fa
        ) AS description,

        logo_url,
        website_url,
        repository_url,
        developer_name,
        license_name,
        published_at

      FROM apps

      WHERE slug = ?
        AND status = 'PUBLISHED'

      LIMIT 1`,
    )
    .bind(slug)
    .first<AppRow>();

  if (!row) {
    notFound();
  }

  const app: AppDetailData = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameFa: null,
    shortDescription:
      row.short_description,
    description: row.description,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    repositoryUrl:
      row.repository_url,
    developerName:
      row.developer_name,
    licenseName:
      row.license_name,
    publishedAt:
      row.published_at,
  };

  const [
    categoriesResult,
    platformsResult,
    linksResult,
    screenshotsResult,
  ] = await Promise.all([
    env.appkhor_db
      .prepare(
        `SELECT
          categories.id,
          categories.slug,

          COALESCE(
            categories.name_en,
            categories.name_fa
          ) AS name

        FROM app_categories

        INNER JOIN categories
          ON categories.id =
            app_categories.category_id

        WHERE app_categories.app_id = ?
          AND categories.is_active = 1

        ORDER BY
          categories.sort_order,
          categories.name_fa`,
      )
      .bind(app.id)
      .all<CategoryRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          platforms.slug,

          COALESCE(
            platforms.name_en,
            platforms.name_fa
          ) AS name

        FROM app_platforms

        INNER JOIN platforms
          ON platforms.id =
            app_platforms.platform_id

        WHERE app_platforms.app_id = ?
          AND platforms.is_active = 1

        ORDER BY
          platforms.sort_order,
          platforms.name_fa`,
      )
      .bind(app.id)
      .all<PlatformRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          app_links.id,

          COALESCE(
            app_links.label_en,
            app_links.label_fa
          ) AS label,

          app_links.link_type,
          app_links.is_primary,

          COALESCE(
            platforms.name_en,
            platforms.name_fa
          ) AS platform_name,

          platforms.slug AS platform_slug

        FROM app_links

        LEFT JOIN platforms
          ON platforms.id =
            app_links.platform_id

        WHERE app_links.app_id = ?
          AND app_links.is_active = 1

        ORDER BY
          app_links.is_primary DESC,
          app_links.sort_order,
          app_links.created_at`,
      )
      .bind(app.id)
      .all<AppLinkRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          image_url,

          COALESCE(
            title_en,
            title_fa
          ) AS title,

          COALESCE(
            alt_en,
            alt_fa
          ) AS alt,

          sort_order

        FROM app_screenshots

        WHERE app_id = ?
          AND is_active = 1

        ORDER BY
          sort_order,
          created_at`,
      )
      .bind(app.id)
      .all<ScreenshotRow>(),
  ]);

  const categories: AppCategory[] =
    (categoriesResult.results ?? []).map(
      (category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
      }),
    );

  const platforms: AppPlatform[] =
    (platformsResult.results ?? []).map(
      (platform) => ({
        slug: platform.slug,
        name: platform.name,
      }),
    );

  const links: AppOfficialLink[] =
    (linksResult.results ?? []).map(
      (link) => ({
        id: link.id,
        label: link.label,
        type: link.link_type,
        isPrimary:
          link.is_primary === 1,
        platformName:
          link.platform_name,
        platformSlug:
          link.platform_slug,
      }),
    );

  const screenshots: AppScreenshot[] =
    (screenshotsResult.results ?? []).map(
      (screenshot) => ({
        url: screenshot.image_url,
        alt:
          screenshot.alt ||
          app.name,
        label:
          screenshot.title ||
          app.name,
      }),
    );

  const categoryIds =
    categories.map(
      (category) => category.id,
    );

  let relatedApps: RelatedApp[] = [];

  if (categoryIds.length > 0) {
    const placeholders =
      categoryIds
        .map(() => "?")
        .join(",");

    const relatedResult =
      await env.appkhor_db
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

            (
              SELECT COALESCE(
                categories.name_en,
                categories.name_fa
              )

              FROM app_categories

              INNER JOIN categories
                ON categories.id =
                  app_categories.category_id

              WHERE
                app_categories.app_id =
                  apps.id

                AND
                  categories.is_active = 1

              ORDER BY
                categories.sort_order,
                categories.name_fa

              LIMIT 1
            ) AS category_name

          FROM apps

          WHERE
            apps.status = 'PUBLISHED'

            AND apps.id <> ?

            AND EXISTS (
              SELECT 1
              FROM app_categories
                related_ac

              WHERE
                related_ac.app_id =
                  apps.id

                AND
                  related_ac.category_id
                  IN (${placeholders})
            )

          ORDER BY
            apps.is_featured DESC,

            CASE
              WHEN apps.published_at
                IS NULL
              THEN 1
              ELSE 0
            END,

            apps.published_at DESC,
            apps.created_at DESC

          LIMIT 3`,
        )
        .bind(
          app.id,
          ...categoryIds,
        )
        .all<RelatedRow>();

    relatedApps =
      (relatedResult.results ?? []).map(
        (related) => ({
          id: related.id,
          slug: related.slug,
          name: related.name,
          nameFa: null,
          description:
            related.description,
          logoUrl:
            related.logo_url,
          category:
            related.category_name,
        }),
      );
  }

  return (
    <AppDetailClient
      app={app}
      categories={categories}
      platforms={platforms}
      links={links}
      screenshots={screenshots}
      highlights={getHighlights(
        app,
        platforms,
      )}
      relatedApps={relatedApps}
      locale="en"
    />
  );
}