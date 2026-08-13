import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

type CurrentUserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  account_role: "USER" | "ADMIN" | "SUPER_ADMIN";
  account_status: "ACTIVE" | "SUSPENDED" | "DELETED";
  email_verified_at: string | null;
};

function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key === name) {
      return valueParts.join("=") || null;
    }
  }

  return null;
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request) {
  try {
    const sessionToken = getCookieValue(
      request.headers.get("cookie"),
      "appkhor_session",
    );

    if (!sessionToken) {
      return Response.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 },
      );
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
          users.account_status,
          users.email_verified_at
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?
          AND sessions.expires_at > CURRENT_TIMESTAMP
        LIMIT 1`,
      )
      .bind(tokenHash)
      .first<CurrentUserRow>();

    if (!user || user.account_status !== "ACTIVE") {
      return Response.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 },
      );
    }

    await env.appkhor_db
      .prepare(
        `UPDATE sessions
        SET last_used_at = CURRENT_TIMESTAMP
        WHERE token_hash = ?`,
      )
      .bind(tokenHash)
      .run();

    return Response.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        role: user.account_role,
        emailVerified: Boolean(user.email_verified_at),
      },
    });
  } catch (error) {
    console.error("Current user error:", error);

    return Response.json(
      {
        authenticated: false,
        user: null,
        message: "در دریافت اطلاعات حساب مشکلی پیش آمد.",
      },
      { status: 500 },
    );
  }
}