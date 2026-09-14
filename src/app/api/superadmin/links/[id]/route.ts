import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";

type UpdateLinkBody = {
  isActive?: unknown;
};

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
          message:
            "\u062f\u0633\u062a\u0631\u0633\u06cc \u063a\u06cc\u0631\u0645\u062c\u0627\u0632 \u0627\u0633\u062a.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const linkId = id.trim();

    if (!linkId) {
      return Response.json(
        {
          success: false,
          message:
            "\u0634\u0646\u0627\u0633\u0647 \u0644\u06cc\u0646\u06a9 \u0645\u0639\u062a\u0628\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    const body =
      (await request.json()) as UpdateLinkBody;

    if (typeof body.isActive !== "boolean") {
      return Response.json(
        {
          success: false,
          message:
            "\u0648\u0636\u0639\u06cc\u062a \u0644\u06cc\u0646\u06a9 \u0645\u0639\u062a\u0628\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    const { env } = getCloudflareContext();

    const existingLink = await env.appkhor_db
      .prepare(
        `SELECT
          id,
          is_active
        FROM app_links
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(linkId)
      .first<{
        id: string;
        is_active: number;
      }>();

    if (!existingLink) {
      return Response.json(
        {
          success: false,
          message:
            "\u0644\u06cc\u0646\u06a9 \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f.",
        },
        { status: 404 },
      );
    }

    await env.appkhor_db.batch([
      env.appkhor_db
        .prepare(
          `UPDATE app_links
          SET
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          body.isActive ? 1 : 0,
          linkId,
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
          "SUPERADMIN_LINK_STATUS_UPDATE",
          "APP_LINK",
          linkId,
          JSON.stringify({
            isActive:
              existingLink.is_active === 1,
          }),
          JSON.stringify({
            isActive: body.isActive,
          }),
          JSON.stringify({
            superadminEmail: session.email,
          }),
        ),
    ]);

    return Response.json({
      success: true,
      link: {
        id: linkId,
        isActive: body.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Update superadmin link status error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "\u062f\u0631 \u062a\u063a\u06cc\u06cc\u0631 \u0648\u0636\u0639\u06cc\u062a \u0644\u06cc\u0646\u06a9 \u0645\u0634\u06a9\u0644\u06cc \u067e\u06cc\u0634 \u0622\u0645\u062f.",
      },
      { status: 500 },
    );
  }
}
