import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

type CurrentUserRow = {
  id: string;
  account_status: string;
};

function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

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

export async function GET(request: Request) {
  try {
    const sessionToken = getCookie(
      request,
      "appkhor_session",
    );

    if (!sessionToken) {
      return Response.redirect(
        new URL(
          "/auth?google_error=login_required_to_link",
          request.url,
        ),
        302,
      );
    }

    const tokenHash = await hashToken(sessionToken);

    const { env } = getCloudflareContext();

    const googleEnv = env as typeof env & {
      GOOGLE_CLIENT_ID?: string;
      APP_URL?: string;
    };

    if (
      !googleEnv.GOOGLE_CLIENT_ID ||
      !googleEnv.APP_URL
    ) {
      return Response.json(
        {
          success: false,
          message: "تنظیمات ورود با گوگل کامل نیست.",
        },
        { status: 500 },
      );
    }

    const user = await env.appkhor_db
      .prepare(
        `SELECT
          users.id,
          users.account_status
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
      return Response.redirect(
        new URL(
          "/auth?google_error=login_required_to_link",
          googleEnv.APP_URL,
        ),
        302,
      );
    }

    const state = randomToken(32);

    const redirectUri =
      `${googleEnv.APP_URL}/api/auth/google/callback`;

    const googleUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );

    googleUrl.searchParams.set(
      "client_id",
      googleEnv.GOOGLE_CLIENT_ID,
    );

    googleUrl.searchParams.set(
      "redirect_uri",
      redirectUri,
    );

    googleUrl.searchParams.set(
      "response_type",
      "code",
    );

    googleUrl.searchParams.set(
      "scope",
      "openid email profile",
    );

    googleUrl.searchParams.set(
      "state",
      state,
    );

    googleUrl.searchParams.set(
      "prompt",
      "select_account",
    );

    const isHttps =
      new URL(request.url).protocol === "https:";

    const stateCookie = [
      `appkhor_google_oauth_state=${state}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=600",
      isHttps ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    const modeCookie = [
      "appkhor_google_oauth_mode=link",
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=600",
      isHttps ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    return new Response(null, {
      status: 302,
      headers: [
        ["Location", googleUrl.toString()],
        ["Set-Cookie", stateCookie],
        ["Set-Cookie", modeCookie],
      ],
    });
  } catch (error) {
    console.error("Google account link error:", error);

    return Response.redirect(
      new URL(
        "/auth?google_error=link_failed",
        request.url,
      ),
      302,
    );
  }
}