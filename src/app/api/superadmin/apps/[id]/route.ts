import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";

type UpdateAppBody = {
  name?: unknown;
  nameFa?: unknown;
  slug?: unknown;
  shortDescriptionFa?: unknown;
  descriptionFa?: unknown;
  logoUrl?: unknown;
  websiteUrl?: unknown;
  repositoryUrl?: unknown;
  developerName?: unknown;
  licenseName?: unknown;
  searchKeywords?: unknown;
  status?: unknown;
  isFeatured?: unknown;
  sortOrder?: unknown;
  categoryIds?: unknown;
  platformIds?: unknown;
  links?: unknown;
  screenshots?: unknown;
};

type AppLinkInput = {
  platformId?: unknown;
  labelFa?: unknown;
  url?: unknown;
  linkType?: unknown;
  isPrimary?: unknown;
  sortOrder?: unknown;
};

type ScreenshotInput = {
  imageUrl?: unknown;
  titleFa?: unknown;
  altFa?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

const VALID_STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const VALID_LINK_TYPES = new Set([
  "DOWNLOAD",
  "RUN",
  "WEBSITE",
  "SOURCE",
  "DOCS",
  "STORE",
  "OTHER",
]);

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function requiredString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeInteger(value: unknown, fallback = 0): number {
  const numeric =
    typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) return fallback;
  return Math.trunc(numeric);
}

function isHttpUrl(value: string | null): boolean {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function mediaIdFromUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value, "https://appkhor.invalid");

    const match = url.pathname.match(
      /^\/media\/([0-9a-fA-F-]{36})$/,
    );

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const session = await getSuperadminSession();

    if (!session) {
      return Response.json(
        { success: false, message: "دسترسی غیرمجاز است." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const appId = id.trim();

    if (!appId) {
      return Response.json(
        { success: false, message: "شناسه اپ معتبر نیست." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateAppBody;

    const name = requiredString(body.name);
    const nameFa = optionalString(body.nameFa);
    const slug = requiredString(body.slug).toLowerCase();
    const shortDescriptionFa = requiredString(body.shortDescriptionFa);
    const descriptionFa = optionalString(body.descriptionFa);
    const logoUrl = optionalString(body.logoUrl);
    const websiteUrl = optionalString(body.websiteUrl);
    const repositoryUrl = optionalString(body.repositoryUrl);
    const developerName = optionalString(body.developerName);
    const licenseName = optionalString(body.licenseName);
    const searchKeywords = optionalString(body.searchKeywords);

    const status =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "DRAFT";

    const isFeatured = body.isFeatured === true ? 1 : 0;
    const sortOrder = normalizeInteger(body.sortOrder);
    const categoryIds = normalizeStringArray(body.categoryIds);
    const platformIds = normalizeStringArray(body.platformIds);

    if (!name) {
      return Response.json(
        { success: false, message: "نام انگلیسی اپ الزامی است." },
        { status: 400 },
      );
    }

    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return Response.json(
        { success: false, message: "Slug معتبر نیست." },
        { status: 400 },
      );
    }

    if (!shortDescriptionFa) {
      return Response.json(
        { success: false, message: "توضیح کوتاه فارسی الزامی است." },
        { status: 400 },
      );
    }

    if (!VALID_STATUSES.has(status)) {
      return Response.json(
        { success: false, message: "وضعیت اپ معتبر نیست." },
        { status: 400 },
      );
    }

    for (const [label, value] of [
      ["لوگو", logoUrl],
      ["وب‌سایت رسمی", websiteUrl],
      ["مخزن پروژه", repositoryUrl],
    ] as const) {
      if (!isHttpUrl(value)) {
        return Response.json(
          { success: false, message: `آدرس ${label} معتبر نیست.` },
          { status: 400 },
        );
      }
    }

    const rawLinks = Array.isArray(body.links)
      ? (body.links as AppLinkInput[])
      : [];

    const links = rawLinks.map((item, index) => ({
      id: crypto.randomUUID(),
      platformId: optionalString(item.platformId),
      labelFa: requiredString(item.labelFa),
      url: requiredString(item.url),
      linkType:
        typeof item.linkType === "string"
          ? item.linkType.trim().toUpperCase()
          : "OTHER",
      isPrimary: item.isPrimary === true ? 1 : 0,
      sortOrder: normalizeInteger(item.sortOrder, index * 10),
    }));

    for (const link of links) {
      if (!link.labelFa || !link.url) {
        return Response.json(
          {
            success: false,
            message: "عنوان و URL همه لینک‌ها الزامی است.",
          },
          { status: 400 },
        );
      }

      if (!VALID_LINK_TYPES.has(link.linkType)) {
        return Response.json(
          { success: false, message: "نوع یکی از لینک‌ها معتبر نیست." },
          { status: 400 },
        );
      }

      if (!isHttpUrl(link.url)) {
        return Response.json(
          {
            success: false,
            message: "یکی از URLهای لینک‌ها معتبر نیست.",
          },
          { status: 400 },
        );
      }
    }

    const rawScreenshots = Array.isArray(body.screenshots)
      ? (body.screenshots as ScreenshotInput[])
      : [];

    const screenshots = rawScreenshots.map((item, index) => ({
      id: crypto.randomUUID(),
      imageUrl: requiredString(item.imageUrl),
      titleFa: optionalString(item.titleFa),
      altFa: optionalString(item.altFa),
      sortOrder: normalizeInteger(item.sortOrder, index * 10),
      isActive: item.isActive === false ? 0 : 1,
    }));

    for (const screenshot of screenshots) {
      if (!screenshot.imageUrl || !isHttpUrl(screenshot.imageUrl)) {
        return Response.json(
          {
            success: false,
            message: "یکی از URLهای تصاویر معتبر نیست.",
          },
          { status: 400 },
        );
      }
    }

    const { env } = getCloudflareContext();

    const existingApp = await env.appkhor_db
      .prepare(
        `SELECT id, logo_url
        FROM apps
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(appId)
      .first<{ id: string; logo_url: string | null }>();

    const existingScreenshotsResult =
      await env.appkhor_db
        .prepare(
          `SELECT image_url
          FROM app_screenshots
          WHERE app_id = ?`,
        )
        .bind(appId)
        .all<{ image_url: string }>();


    if (!existingApp) {
      return Response.json(
        { success: false, message: "اپ پیدا نشد." },
        { status: 404 },
      );
    }

    const slugConflict = await env.appkhor_db
      .prepare(
        `SELECT id
        FROM apps
        WHERE slug = ?
          AND id <> ?
        LIMIT 1`,
      )
      .bind(slug, appId)
      .first<{ id: string }>();

    if (slugConflict) {
      return Response.json(
        { success: false, message: "این Slug قبلاً استفاده شده است." },
        { status: 409 },
      );
    }

    const oldMediaIds = new Set<string>();

    const oldLogoMediaId = mediaIdFromUrl(
      existingApp.logo_url,
    );

    if (oldLogoMediaId) {
      oldMediaIds.add(oldLogoMediaId);
    }

    for (
      const screenshot of
      existingScreenshotsResult.results ?? []
    ) {
      const mediaId = mediaIdFromUrl(
        screenshot.image_url,
      );

      if (mediaId) {
        oldMediaIds.add(mediaId);
      }
    }

    const newMediaIds = new Set<string>();

    const newLogoMediaId = mediaIdFromUrl(logoUrl);

    if (newLogoMediaId) {
      newMediaIds.add(newLogoMediaId);
    }

    for (const screenshot of screenshots) {
      const mediaId = mediaIdFromUrl(
        screenshot.imageUrl,
      );

      if (mediaId) {
        newMediaIds.add(mediaId);
      }
    }

    const staleMediaIds = Array.from(
      oldMediaIds,
    ).filter(
      (mediaId) => !newMediaIds.has(mediaId),
    );


    const statements = [
      env.appkhor_db
        .prepare(
          `UPDATE apps
          SET
            slug = ?,
            name = ?,
            name_fa = ?,
            short_description_fa = ?,
            description_fa = ?,
            logo_url = ?,
            website_url = ?,
            repository_url = ?,
            developer_name = ?,
            license_name = ?,
            search_keywords = ?,
            status = ?,
            is_featured = ?,
            sort_order = ?,
            published_at = CASE
              WHEN ? = 'PUBLISHED'
                THEN COALESCE(published_at, CURRENT_TIMESTAMP)
              ELSE NULL
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          slug,
          name,
          nameFa,
          shortDescriptionFa,
          descriptionFa,
          logoUrl,
          websiteUrl,
          repositoryUrl,
          developerName,
          licenseName,
          searchKeywords,
          status,
          isFeatured,
          sortOrder,
          status,
          appId,
        ),

      env.appkhor_db
        .prepare(`DELETE FROM app_categories WHERE app_id = ?`)
        .bind(appId),

      env.appkhor_db
        .prepare(`DELETE FROM app_platforms WHERE app_id = ?`)
        .bind(appId),

      env.appkhor_db
        .prepare(`DELETE FROM app_links WHERE app_id = ?`)
        .bind(appId),

      env.appkhor_db
        .prepare(`DELETE FROM app_screenshots WHERE app_id = ?`)
        .bind(appId),
    ];

    for (const categoryId of categoryIds) {
      statements.push(
        env.appkhor_db
          .prepare(
            `INSERT INTO app_categories (
              app_id,
              category_id
            )
            VALUES (?, ?)`,
          )
          .bind(appId, categoryId),
      );
    }

    for (const platformId of platformIds) {
      statements.push(
        env.appkhor_db
          .prepare(
            `INSERT INTO app_platforms (
              app_id,
              platform_id
            )
            VALUES (?, ?)`,
          )
          .bind(appId, platformId),
      );
    }

    for (const link of links) {
      statements.push(
        env.appkhor_db
          .prepare(
            `INSERT INTO app_links (
              id,
              app_id,
              platform_id,
              label_fa,
              url,
              link_type,
              is_primary,
              is_active,
              sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          )
          .bind(
            link.id,
            appId,
            link.platformId,
            link.labelFa,
            link.url,
            link.linkType,
            link.isPrimary,
            link.sortOrder,
          ),
      );
    }

    for (const screenshot of screenshots) {
      statements.push(
        env.appkhor_db
          .prepare(
            `INSERT INTO app_screenshots (
              id,
              app_id,
              image_url,
              title_fa,
              alt_fa,
              sort_order,
              is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            screenshot.id,
            appId,
            screenshot.imageUrl,
            screenshot.titleFa,
            screenshot.altFa,
            screenshot.sortOrder,
            screenshot.isActive,
          ),
      );
    }

    await env.appkhor_db.batch(statements);

    try {
      for (const mediaId of staleMediaIds) {
        const mediaPath = `%/media/${mediaId}`;

        await env.appkhor_db
          .prepare(
            `DELETE FROM media_assets
            WHERE id = ?
              AND NOT EXISTS (
                SELECT 1
                FROM apps
                WHERE logo_url LIKE ?
              )
              AND NOT EXISTS (
                SELECT 1
                FROM app_screenshots
                WHERE image_url LIKE ?
              )`,
          )
          .bind(
            mediaId,
            mediaPath,
            mediaPath,
          )
          .run();
      }
    } catch (cleanupError) {
      console.error(
        "Cleanup stale media assets failed:",
        cleanupError,
      );
    }

    return Response.json({
      success: true,
      message: "اپ با موفقیت ویرایش شد.",
      app: {
        id: appId,
        slug,
      },
    });
  } catch (error) {
    console.error("Update superadmin app error:", error);

    return Response.json(
      {
        success: false,
        message: "در ویرایش اپ مشکلی پیش آمد.",
      },
      { status: 500 },
    );
  }
}
