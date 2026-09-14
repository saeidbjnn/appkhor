import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";

type CreateCategoryBody = {
  slug?: unknown;
  nameFa?: unknown;
  descriptionFa?: unknown;
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

export async function POST(request: Request) {
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

    const body = (await request.json()) as CreateCategoryBody;

    const slug = requiredString(body.slug).toLowerCase();
    const nameFa = requiredString(body.nameFa);
    const descriptionFa = optionalString(body.descriptionFa);
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
          message: "\u0646\u0627\u0645 \u0641\u0627\u0631\u0633\u06cc \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc \u0627\u0644\u0632\u0627\u0645\u06cc \u0627\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    const { env } = getCloudflareContext();

    const conflict = await env.appkhor_db
      .prepare(
        `SELECT id
        FROM categories
        WHERE slug = ?
        LIMIT 1`,
      )
      .bind(slug)
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

    const id = crypto.randomUUID();

    await env.appkhor_db
      .prepare(
        `INSERT INTO categories (
          id,
          slug,
          name_fa,
          description_fa,
          icon,
          sort_order,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        slug,
        nameFa,
        descriptionFa,
        icon,
        sortOrder,
        isActive,
      )
      .run();

    return Response.json(
      {
        success: true,
        category: {
          id,
          slug,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);

    return Response.json(
      {
        success: false,
        message: "\u0633\u0627\u062e\u062a \u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
      },
      { status: 500 },
    );
  }
}
