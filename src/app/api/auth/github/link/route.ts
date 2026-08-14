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

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function createCodeChallenge(
  verifier: string,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );

  return base64UrlEncode(
    new Uint8Array(digest),
  );
}

function createCookie(
  name: string,
  value: string,
  isHttps: boolean,
): string {
  return [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=600",
    isHttps ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
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
          "/auth?github_error=login_required_to_link",
          request.url,
        ),
        302,
      );
    }

    const tokenHash =
      await hashToken(sessionToken);

    const { env } = getCloudflareContext();

    const githubEnv = env as typeof env & {
      GITHUB_CLIENT_ID?: string;
      APP_URL?: string;
    };

    if (
      !githubEnv.GITHUB_CLIENT_ID ||
      !githubEnv.APP_URL
    ) {
      return Response.json(
        {
          success: false,
          message:
            "تنظیمات ورود با گیت‌هاب کامل نیست.",
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

    if (
      !user ||
      user.account_status !== "ACTIVE"
    ) {
      return Response.redirect(
        new URL(
          "/auth?github_error=login_required_to_link",
          githubEnv.APP_URL,
        ),
        302,
      );
    }

    const state = randomToken(32);
    const codeVerifier = randomToken(48);

    const codeChallenge =
      await createCodeChallenge(codeVerifier);

    const redirectUri =
      `${githubEnv.APP_URL}/api/auth/github/callback`;

    const githubUrl = new URL(
      "https://github.com/login/oauth/authorize",
    );

    githubUrl.searchParams.set(
      "client_id",
      githubEnv.GITHUB_CLIENT_ID,
    );

    githubUrl.searchParams.set(
      "redirect_uri",
      redirectUri,
    );

    githubUrl.searchParams.set(
      "scope",
      "read:user user:email",
    );

    githubUrl.searchParams.set(
      "state",
      state,
    );

    githubUrl.searchParams.set(
      "code_challenge",
      codeChallenge,
    );

    githubUrl.searchParams.set(
      "code_challenge_method",
      "S256",
    );

    const isHttps =
      new URL(request.url).protocol === "https:";

    return new Response(null, {
      status: 302,
      headers: [
        ["Location", githubUrl.toString()],
        [
          "Set-Cookie",
          createCookie(
            "appkhor_github_oauth_state",
            state,
            isHttps,
          ),
        ],
        [
          "Set-Cookie",
          createCookie(
            "appkhor_github_oauth_verifier",
            codeVerifier,
            isHttps,
          ),
        ],
        [
          "Set-Cookie",
          createCookie(
            "appkhor_github_oauth_mode",
            "link",
            isHttps,
          ),
        ],
      ],
    });
  } catch (error) {
    console.error(
      "GitHub account link error:",
      error,
    );

    return Response.redirect(
      new URL(
        "/auth?github_error=link_failed",
        request.url,
      ),
      302,
    );
  }
}