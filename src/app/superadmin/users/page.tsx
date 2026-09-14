import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminUsersClient from "./superadmin-users-client";

export type SuperadminUserRow = {
  id: string;
  email: string;
  displayName: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  lastLoginAt: string | null;
  identityCount: number;
  activeSessionCount: number;
};

type UserRow = {
  id: string;
  email: string;
  display_name: string | null;
  account_role: SuperadminUserRow["role"];
  account_status: SuperadminUserRow["status"];
  created_at: string;
  last_login_at: string | null;
  identity_count: number;
  active_session_count: number;
};

export default async function SuperadminUsersPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const result = await env.appkhor_db
    .prepare(
      `SELECT
        u.id,
        COALESCE(u.primary_email, u.email) AS email,
        u.display_name,
        u.account_role,
        u.account_status,
        u.created_at,
        u.last_login_at,
        (
          SELECT COUNT(*)
          FROM auth_identities ai
          WHERE ai.user_id = u.id
        ) AS identity_count,
        (
          SELECT COUNT(*)
          FROM sessions s
          WHERE s.user_id = u.id
            AND s.expires_at > CURRENT_TIMESTAMP
        ) AS active_session_count
      FROM users u
      ORDER BY u.created_at DESC`,
    )
    .all<UserRow>();

  const users: SuperadminUserRow[] =
    (result.results ?? []).map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.account_role,
      status: user.account_status,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      identityCount: Number(user.identity_count ?? 0),
      activeSessionCount: Number(
        user.active_session_count ?? 0,
      ),
    }));

  return (
    <SuperadminUsersClient
      email={session.email}
      users={users}
    />
  );
}
