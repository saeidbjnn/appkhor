import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import AppDetailClient from "./app-detail-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type AppDetailData = {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  shortDescription: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  repositoryUrl: string | null;
  developerName: string | null;
  licenseName: string | null;
  publishedAt: string | null;
};

export type AppCategory = {
  id: string;
  slug: string;
  name: string;
};

export type AppPlatform = {
  slug: string;
  name: string;
};

export type AppOfficialLink = {
  id: string;
  label: string;
  type: string;
  isPrimary: boolean;
  platformName: string | null;
  platformSlug: string | null;
};

export type AppScreenshot = {
  url: string;
  alt: string;
  label: string;
};

export type AppHighlight = {
  title: string;
  description: string;
  icon: string;
};

export type RelatedApp = {
  id: string;
  slug: string;
  name: string;
  nameFa: string | null;
  description: string;
  logoUrl: string | null;
  category: string | null;
};

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
  published_at: string | null;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_fa: string;
};

type PlatformRow = {
  slug: string;
  name_fa: string;
};

type AppLinkRow = {
  id: string;
  label_fa: string;
  link_type: string;
  is_primary: number;
  platform_name_fa: string | null;
  platform_slug: string | null;
};

type RelatedRow = {
  id: string;
  slug: string;
  name: string;
  name_fa: string | null;
  short_description_fa: string;
  logo_url: string | null;
  category_name_fa: string | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getScreenshots(slug: string): AppScreenshot[] {
  if (slug === "vlc") {
    return [
      {
        url: "https://images.videolan.org/vlc/screenshots/3.0.0/3.0.17-windows11-fitted.jpg",
        alt: "نمای VLC media player در ویندوز 11",
        label: "VLC در ویندوز",
      },
      {
        url: "https://images.videolan.org/vlc/screenshots/3.0.0/3.0-ubuntu-fitted.jpg",
        alt: "نمای VLC media player در اوبونتو",
        label: "VLC در لینوکس",
      },
      {
        url: "https://images.videolan.org/vlc/screenshots/3.0.0/3.0.0_4k_windows_1.jpg",
        alt: "نمای VLC media player هنگام پخش ویدیو در ویندوز",
        label: "محیط پخش",
      },
    ];
  }

  return [];
}

function getHighlights(
  app: AppDetailData,
  platforms: AppPlatform[],
): AppHighlight[] {
  if (app.slug === "vlc") {
    return [
      {
        title: "پخش فرمت‌های متنوع",
        description:
          "برای پخش طیف بزرگی از فایل‌های صوتی و تصویری، دیسک‌ها و استریم‌ها طراحی شده است.",
        icon: "▶",
      },
      {
        title: "بدون نیاز به Codec Pack",
        description:
          "بسیاری از فرمت‌های رایج را بدون نصب بسته‌های کدک جداگانه پخش می‌کند.",
        icon: "◫",
      },
      {
        title: "چندپلتفرمی",
        description: `در اپ‌خور برای ${platforms.length.toLocaleString("fa-IR")} پلتفرم فعال ثبت شده است.`,
        icon: "⌘",
      },
      {
        title: "آزاد و متن‌باز",
        description:
          "کد منبع پروژه در دسترس است و لینک مخزن رسمی آن از همین صفحه قابل دسترسی است.",
        icon: "⌁",
      },
    ];
  }

  const items: AppHighlight[] = [];

  if (platforms.length > 1) {
    items.push({
      title: "چندپلتفرمی",
      description: `برای ${platforms.length.toLocaleString("fa-IR")} پلتفرم در اپ‌خور ثبت شده است.`,
      icon: "⌘",
    });
  }

  if (app.repositoryUrl) {
    items.push({
      title: "متن‌باز",
      description: "مخزن کد منبع رسمی پروژه از همین صفحه قابل دسترسی است.",
      icon: "⌁",
    });
  }

  items.push({
    title: "منبع رسمی",
    description:
      "لینک‌های دریافت اپ‌خور مستقیماً به منابع رسمی پروژه هدایت می‌شوند.",
    icon: "↗",
  });

  return items;
}

export default async function AppDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { env } = getCloudflareContext();

  const row = await env.appkhor_db
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
    nameFa: row.name_fa,
    shortDescription: row.short_description_fa,
    description: row.description_fa,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    repositoryUrl: row.repository_url,
    developerName: row.developer_name,
    licenseName: row.license_name,
    publishedAt: row.published_at,
  };

  const [categoriesResult, platformsResult, linksResult] = await Promise.all([
    env.appkhor_db
      .prepare(
        `SELECT
          categories.id,
          categories.slug,
          categories.name_fa
        FROM app_categories
        INNER JOIN categories
          ON categories.id = app_categories.category_id
        WHERE app_categories.app_id = ?
          AND categories.is_active = 1
        ORDER BY categories.sort_order, categories.name_fa`,
      )
      .bind(app.id)
      .all<CategoryRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          platforms.slug,
          platforms.name_fa
        FROM app_platforms
        INNER JOIN platforms
          ON platforms.id = app_platforms.platform_id
        WHERE app_platforms.app_id = ?
          AND platforms.is_active = 1
        ORDER BY platforms.sort_order, platforms.name_fa`,
      )
      .bind(app.id)
      .all<PlatformRow>(),

    env.appkhor_db
      .prepare(
        `SELECT
          app_links.id,
          app_links.label_fa,
          app_links.link_type,
          app_links.is_primary,
          platforms.name_fa AS platform_name_fa,
platforms.slug AS platform_slug
        FROM app_links
        LEFT JOIN platforms
          ON platforms.id = app_links.platform_id
        WHERE app_links.app_id = ?
          AND app_links.is_active = 1
        ORDER BY
          app_links.is_primary DESC,
          app_links.sort_order,
          app_links.created_at`,
      )
      .bind(app.id)
      .all<AppLinkRow>(),
  ]);

  const categories: AppCategory[] = (categoriesResult.results ?? []).map(
    (category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name_fa,
    }),
  );

  const platforms: AppPlatform[] = (platformsResult.results ?? []).map(
    (platform) => ({
      slug: platform.slug,
      name: platform.name_fa,
    }),
  );

  const links: AppOfficialLink[] = (linksResult.results ?? []).map((link) => ({
    id: link.id,
    label: link.label_fa,
    type: link.link_type,
    isPrimary: link.is_primary === 1,
    platformName: link.platform_name_fa,
    platformSlug: link.platform_slug,
  }));

  const categoryIds = categories.map((category) => category.id);
  let relatedApps: RelatedApp[] = [];

  if (categoryIds.length > 0) {
    const placeholders = categoryIds.map(() => "?").join(",");

    const relatedResult = await env.appkhor_db
      .prepare(
        `SELECT
          apps.id,
          apps.slug,
          apps.name,
          apps.name_fa,
          apps.short_description_fa,
          apps.logo_url,
          (
            SELECT categories.name_fa
            FROM app_categories
            INNER JOIN categories
              ON categories.id = app_categories.category_id
            WHERE app_categories.app_id = apps.id
              AND categories.is_active = 1
            ORDER BY categories.sort_order, categories.name_fa
            LIMIT 1
          ) AS category_name_fa
        FROM apps
        WHERE apps.status = 'PUBLISHED'
          AND apps.id <> ?
          AND EXISTS (
            SELECT 1
            FROM app_categories related_ac
            WHERE related_ac.app_id = apps.id
              AND related_ac.category_id IN (${placeholders})
          )
        ORDER BY
          apps.is_featured DESC,
          CASE WHEN apps.published_at IS NULL THEN 1 ELSE 0 END,
          apps.published_at DESC,
          apps.created_at DESC
        LIMIT 3`,
      )
      .bind(app.id, ...categoryIds)
      .all<RelatedRow>();

    relatedApps = (relatedResult.results ?? []).map((related) => ({
      id: related.id,
      slug: related.slug,
      name: related.name,
      nameFa: related.name_fa,
      description: related.short_description_fa,
      logoUrl: related.logo_url,
      category: related.category_name_fa,
    }));
  }

  return (
    <AppDetailClient
      app={app}
      categories={categories}
      platforms={platforms}
      links={links}
      screenshots={getScreenshots(app.slug)}
      highlights={getHighlights(app, platforms)}
      relatedApps={relatedApps}
    />
  );
}
