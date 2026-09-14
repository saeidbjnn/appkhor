import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";

type UpdateUserBody = {
  role?: unknown;
  status?: unknown;
};

type ExistingUser = {
  id: string;
  account_role: "USER" | "ADMIN" | "SUPER_ADMIN";
  account_status: "ACTIVE" | "SUSPENDED" | "DELETED";
};

const VALID_ROLES = new Set([
  "USER",
  "ADMIN",
]);

const VALID_STATUSES = new Set([
  "ACTIVE",
  "SUSPENDED",
]);

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
    const userId = id.trim();

    const body =
      (await request.json()) as UpdateUserBody;

    const role =
      typeof body.role === "string"
        ? body.role.trim().toUpperCase()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (
      !VALID_ROLES.has(role) ||
      !VALID_STATUSES.has(status)
    ) {
      return Response.json(
        {
          success: false,
          message:
            "\u0646\u0642\u0634 \u06cc\u0627 \u0648\u0636\u0639\u06cc\u062a \u06a9\u0627\u0631\u0628\u0631 \u0645\u0639\u062a\u0628\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    const { env } = getCloudflareContext();

    const existing = await env.appkhor_db
      .prepare(
        `SELECT
          id,
          account_role,
          account_status
        FROM users
        WHERE id = ?
        LIMIT 1`,
      )
      .bind(userId)
      .first<ExistingUser>();

    if (!existing) {
      return Response.json(
        {
          success: false,
          message:
            "\u06a9\u0627\u0631\u0628\u0631 \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f.",
        },
        { status: 404 },
      );
    }

    if (existing.account_role === "SUPER_ADMIN") {
      return Response.json(
        {
          success: false,
          message:
            "\u0646\u0642\u0634 Super Admin \u0627\u0632 \u0627\u06cc\u0646 \u0628\u062e\u0634 \u0642\u0627\u0628\u0644 \u062a\u063a\u06cc\u06cc\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 403 },
      );
    }

    const legacyRole =
      role === "ADMIN" ? "admin" : "user";

    const legacyActive =
      status === "ACTIVE" ? 1 : 0;

    const statements = [
      env.appkhor_db
        .prepare(
          `UPDATE users
          SET
            account_role = ?,
            account_status = ?,
            role = ?,
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          role,
          status,
          legacyRole,
          legacyActive,
          userId,
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
          "SUPERADMIN_USER_UPDATE",
          "USER",
          userId,
          JSON.stringify({
            role: existing.account_role,
            status: existing.account_status,
          }),
          JSON.stringify({
            role,
            status,
          }),
          JSON.stringify({
            superadminEmail: session.email,
          }),
        ),
    ];

    if (status === "SUSPENDED") {
      statements.push(
        env.appkhor_db
          .prepare(
            `DELETE FROM sessions
            WHERE user_id = ?`,
          )
          .bind(userId),
      );
    }

    await env.appkhor_db.batch(statements);

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Update superadmin user error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "\u062f\u0631 \u0648\u06cc\u0631\u0627\u06cc\u0634 \u06a9\u0627\u0631\u0628\u0631 \u0645\u0634\u06a9\u0644\u06cc \u067e\u06cc\u0634 \u0622\u0645\u062f.",
      },
      { status: 500 },
    );
  }
}
