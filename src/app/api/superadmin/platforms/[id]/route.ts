import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";

type UpdatePlatformBody = {
  slug?: unknown;
  nameFa?: unknown;
  icon?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

function requiredString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized || null;
}

function normalizeInteger(value: unknown): number {
  const numeric =
    typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) return 0;

  return Math.trunc(numeric);
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
        {
          success: false,
          message: "\u062f\u0633\u062a\u0631\u0633\u06cc \u063a\u06cc\u0631\u0645\u062c\u0627\u0632 \u0627\u0633\u062a.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const platformId = id.trim();

    if (!platformId) {
      return Response.json(
        {
          success: false,
          message: "\u0634\u0646\u0627\u0633\u0647 \u067e\u0644\u062a\u0641\u0631\u0645 \u0645\u0639\u062a\u0628\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdatePlatformBody;

    const slug = requiredString(body.slug).toLowerCase();
    const nameFa = requiredString(body.nameFa);
    const icon = optionalString(body.icon);
    const sortOrder = normalizeInteger(body.sortOrder);
    const isActive = body.isActive === false ? 0 : 1;

    if (
      !slug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      return Response.json(
        {
          success: false,
          message: "Slug \u0645\u0639\u062a\u0628\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    if (!nameFa) {
      return Response.json(
        {
          success: false,
          message: "\u0646\u0627\u0645 \u0641\u0627\u0631\u0633\u06cc \u067e\u0644\u062a\u0641\u0631\u0645 \u0627\u0644\u0632\u0627\u0645\u06cc \u0627\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    const { env } = getCloudflareContext();

    const existing = await env.appkhor_db
      .prepare(
        `SELECT
          id,
          slug,
          name_fa,
          icon,
          sort_order,
          is_active
        FROM platforms
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(platformId)
      .first<{
        id: string;
        slug: string;
        name_fa: string;
        icon: string | null;
        sort_order: number;
        is_active: number;
      }>();

    if (!existing) {
      return Response.json(
        {
          success: false,
          message: "\u067e\u0644\u062a\u0641\u0631\u0645 \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f.",
        },
        { status: 404 },
      );
    }

    const conflict = await env.appkhor_db
      .prepare(
        `SELECT id
        FROM platforms
        WHERE slug = ?
          AND id <> ?
        LIMIT 1`,
      )
      .bind(slug, platformId)
      .first<{ id: string }>();

    if (conflict) {
      return Response.json(
        {
          success: false,
          message: "\u0627\u06cc\u0646 Slug \u0642\u0628\u0644\u0627\u064b \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0634\u062f\u0647 \u0627\u0633\u062a.",
        },
        { status: 409 },
      );
    }

    await env.appkhor_db.batch([
      env.appkhor_db
        .prepare(
          `UPDATE platforms
          SET
            slug = ?,
            name_fa = ?,
            icon = ?,
            sort_order = ?,
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          slug,
          nameFa,
          icon,
          sortOrder,
          isActive,
          platformId,
        ),

      env.appkhor_db
        .prepare(
          `INSERT INTO audit_logs (
            id,
            actor_user_id,
            action,
            target_type,
            target_id,
            old_value,
            new_value,
            metadata
          )
          VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          "SUPERADMIN_PLATFORM_UPDATE",
          "PLATFORM",
          platformId,
          JSON.stringify({
            slug: existing.slug,
            nameFa: existing.name_fa,
            icon: existing.icon,
            sortOrder: existing.sort_order,
            isActive:
              existing.is_active === 1,
          }),
          JSON.stringify({
            slug,
            nameFa,
            icon,
            sortOrder,
            isActive: isActive === 1,
          }),
          JSON.stringify({
            superadminEmail: session.email,
          }),
        ),
    ]);

    return Response.json({
      success: true,
      platform: {
        id: platformId,
        slug,
      },
    });
  } catch (error) {
    console.error("Update platform error:", error);

    return Response.json(
      {
        success: false,
        message: "\u0648\u06cc\u0631\u0627\u06cc\u0634 \u067e\u0644\u062a\u0641\u0631\u0645 \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
      },
      { status: 500 },
    );
  }
}
