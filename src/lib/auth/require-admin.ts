import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AdminUserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  account_role: "USER" | "ADMIN" | "SUPER_ADMIN";
  account_status: "ACTIVE" | "SUSPENDED" | "DELETED";
};

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("appkhor_session")?.value;

  if (!sessionToken) {
    redirect("/auth/enter");
  }

  const tokenHash = await hashToken(sessionToken);

  const { env } = getCloudflareContext();

  const user = await env.appkhor_db
    .prepare(
      `SELECT
        users.id,
        users.primary_email AS email,
        users.display_name,
        users.avatar_url,
        users.account_role,
        users.account_status
      FROM sessions
      INNER JOIN users
        ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
        AND sessions.expires_at > CURRENT_TIMESTAMP
      LIMIT 1`,
    )
    .bind(tokenHash)
    .first<AdminUserRow>();

  if (!user || user.account_status !== "ACTIVE") {
    redirect("/auth/enter");
  }

  if (
    user.account_role !== "ADMIN" &&
    user.account_role !== "SUPER_ADMIN"
  ) {
    redirect("/");
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    role: user.account_role,
  };
}