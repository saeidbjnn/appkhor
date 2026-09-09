import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

type SuperadminSessionRow = {
  id: string;
  email: string;
};

const SUPERADMIN_EMAIL = "saeid.bararjanian@gmail.com";

async function hashValue(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getSuperadminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(
    "appkhor_superadmin_session",
  )?.value;

  if (!sessionToken) {
    return null;
  }

  const tokenHash = await hashValue(sessionToken);
  const { env } = getCloudflareContext();

  const session = await env.appkhor_db
    .prepare(
      `SELECT
        id,
        email
      FROM superadmin_sessions
      WHERE token_hash = ?
        AND email = ?
        AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1`,
    )
    .bind(tokenHash, SUPERADMIN_EMAIL)
    .first<SuperadminSessionRow>();

  if (!session) {
    return null;
  }

  await env.appkhor_db
    .prepare(
      `UPDATE superadmin_sessions
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    )
    .bind(session.id)
    .run();

  return {
    id: session.id,
    email: session.email,
  };
}
