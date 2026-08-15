import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    link_id: string;
  }>;
};

type OutboundLink = {
  id: string;
  url: string;
};

type SessionUser = {
  user_id: string;
};

function getCookie(
  request: Request,
  name: string,
): string | null {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const item of cookieHeader.split(";")) {
    const [cookieName, ...rest] = item.trim().split("=");

    if (cookieName === name) {
      return rest.join("=") || null;
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

function isAllowedOutboundUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const { link_id: linkId } = await context.params;
  const { env } = getCloudflareContext();

  const link = await env.appkhor_db
    .prepare(
      `SELECT
        app_links.id,
        app_links.url
      FROM app_links
      INNER JOIN apps
        ON apps.id = app_links.app_id
      WHERE app_links.id = ?
        AND app_links.is_active = 1
        AND apps.status = 'PUBLISHED'
      LIMIT 1`,
    )
    .bind(linkId)
    .first<OutboundLink>();

  if (!link || !isAllowedOutboundUrl(link.url)) {
    return new Response("لینک موردنظر پیدا نشد.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  let userId: string | null = null;

  try {
    const sessionToken = getCookie(
      request,
      "appkhor_session",
    );

    if (sessionToken) {
      const sessionTokenHash =
        await hashToken(sessionToken);

      const sessionUser = await env.appkhor_db
        .prepare(
          `SELECT sessions.user_id
          FROM sessions
          INNER JOIN users
            ON users.id = sessions.user_id
          WHERE sessions.token_hash = ?
            AND sessions.expires_at > CURRENT_TIMESTAMP
            AND users.account_status = 'ACTIVE'
          LIMIT 1`,
        )
        .bind(sessionTokenHash)
        .first<SessionUser>();

      userId = sessionUser?.user_id ?? null;
    }
  } catch (error) {
    console.error(
      "Outbound session lookup failed:",
      error,
    );
  }

  try {
    await env.appkhor_db
      .prepare(
        `INSERT INTO outbound_clicks (
          id,
          link_id,
          user_id,
          referrer,
          user_agent
        )
        VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        link.id,
        userId,
        request.headers.get("referer"),
        request.headers.get("user-agent"),
      )
      .run();
  } catch (error) {
    // Redirect should still work even if analytics logging fails.
    console.error(
      "Outbound click logging failed:",
      error,
    );
  }

  return Response.redirect(link.url, 302);
}