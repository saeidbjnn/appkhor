import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

type GoogleTokenResponse = {
  access_token?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

type ExistingGoogleIdentity = {
  user_id: string;
  account_status: string;
};

type ExistingEmailUser = {
  id: string;
};

type CurrentSessionUser = {
  id: string;
  account_status: string;
};

type UserGoogleIdentity = {
  provider_user_id: string;
};

function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

function cookieHeader(
  name: string,
  value: string,
  maxAge: number,
  isHttps: boolean,
): string {
  return [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    isHttps ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function clearGoogleStateCookie(isHttps: boolean): string {
  return cookieHeader(
    "appkhor_google_oauth_state",
    "",
    0,
    isHttps,
  );
}

function clearGoogleModeCookie(isHttps: boolean): string {
  return cookieHeader(
    "appkhor_google_oauth_mode",
    "",
    0,
    isHttps,
  );
}

function redirectToAuth(
  appUrl: string,
  reason: string,
  isHttps: boolean,
): Response {
  const url = new URL("/auth", appUrl);
  url.searchParams.set("google_error", reason);

  return new Response(null, {
    status: 302,
    headers: [
      ["Location", url.toString()],
      ["Set-Cookie", clearGoogleStateCookie(isHttps)],
      ["Set-Cookie", clearGoogleModeCookie(isHttps)],
    ],
  });
}

function redirectHome(
  appUrl: string,
  isHttps: boolean,
  linked = false,
): Response {
  const url = new URL("/", appUrl);

  if (linked) {
    url.searchParams.set("google_linked", "1");
  }

  return new Response(null, {
    status: 302,
    headers: [
      ["Location", url.toString()],
      ["Set-Cookie", clearGoogleStateCookie(isHttps)],
      ["Set-Cookie", clearGoogleModeCookie(isHttps)],
    ],
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const isHttps = requestUrl.protocol === "https:";

  const { env } = getCloudflareContext();

  const googleEnv = env as typeof env & {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    APP_URL?: string;
  };

  if (
    !googleEnv.GOOGLE_CLIENT_ID ||
    !googleEnv.GOOGLE_CLIENT_SECRET ||
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

  const appUrl = googleEnv.APP_URL;

  try {
    const oauthError = requestUrl.searchParams.get("error");

    if (oauthError) {
      return redirectToAuth(
        appUrl,
        "cancelled",
        isHttps,
      );
    }

    const code = requestUrl.searchParams.get("code");
    const returnedState = requestUrl.searchParams.get("state");

    const storedState = getCookie(
      request,
      "appkhor_google_oauth_state",
    );

    const oauthMode = getCookie(
      request,
      "appkhor_google_oauth_mode",
    );

    const isLinkMode = oauthMode === "link";

    if (
      !code ||
      !returnedState ||
      !storedState ||
      returnedState !== storedState
    ) {
      return redirectToAuth(
        appUrl,
        "invalid_state",
        isHttps,
      );
    }

    let linkingUser: CurrentSessionUser | null = null;

    if (isLinkMode) {
      const sessionToken = getCookie(
        request,
        "appkhor_session",
      );

      if (!sessionToken) {
        return redirectToAuth(
          appUrl,
          "login_required_to_link",
          isHttps,
        );
      }

      const sessionTokenHash = await hashToken(sessionToken);

      linkingUser = await env.appkhor_db
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
        .bind(sessionTokenHash)
        .first<CurrentSessionUser>();

      if (
        !linkingUser ||
        linkingUser.account_status !== "ACTIVE"
      ) {
        return redirectToAuth(
          appUrl,
          "login_required_to_link",
          isHttps,
        );
      }
    }

    const redirectUri =
      `${appUrl}/api/auth/google/callback`;

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: googleEnv.GOOGLE_CLIENT_ID,
          client_secret: googleEnv.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      },
    );

    if (!tokenResponse.ok) {
      console.error(
        "Google token exchange failed:",
        await tokenResponse.text(),
      );

      return redirectToAuth(
        appUrl,
        "token_exchange_failed",
        isHttps,
      );
    }

    const tokenData =
      (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenData.access_token) {
      return redirectToAuth(
        appUrl,
        "missing_access_token",
        isHttps,
      );
    }

    const userInfoResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      console.error(
        "Google userinfo failed:",
        await userInfoResponse.text(),
      );

      return redirectToAuth(
        appUrl,
        "userinfo_failed",
        isHttps,
      );
    }

    const googleUser =
      (await userInfoResponse.json()) as GoogleUserInfo;

    if (
      !googleUser.sub ||
      !googleUser.email ||
      googleUser.email_verified !== true
    ) {
      return redirectToAuth(
        appUrl,
        "invalid_google_account",
        isHttps,
      );
    }

    const email = googleUser.email.trim().toLowerCase();

    const existingIdentity = await env.appkhor_db
      .prepare(
        `SELECT
          auth_identities.user_id,
          users.account_status
        FROM auth_identities
        INNER JOIN users
          ON users.id = auth_identities.user_id
        WHERE auth_identities.provider = 'GOOGLE'
          AND auth_identities.provider_user_id = ?
        LIMIT 1`,
      )
      .bind(googleUser.sub)
      .first<ExistingGoogleIdentity>();

    if (isLinkMode) {
      if (!linkingUser) {
        return redirectToAuth(
          appUrl,
          "login_required_to_link",
          isHttps,
        );
      }

      if (
        existingIdentity &&
        existingIdentity.user_id !== linkingUser.id
      ) {
        return redirectToAuth(
          appUrl,
          "google_already_linked_elsewhere",
          isHttps,
        );
      }

      const currentGoogleIdentity = await env.appkhor_db
        .prepare(
          `SELECT provider_user_id
          FROM auth_identities
          WHERE user_id = ?
            AND provider = 'GOOGLE'
          LIMIT 1`,
        )
        .bind(linkingUser.id)
        .first<UserGoogleIdentity>();

      if (
        currentGoogleIdentity &&
        currentGoogleIdentity.provider_user_id !== googleUser.sub
      ) {
        return redirectToAuth(
          appUrl,
          "google_already_linked",
          isHttps,
        );
      }

      if (!existingIdentity && !currentGoogleIdentity) {
        await env.appkhor_db
          .prepare(
            `INSERT INTO auth_identities (
              id,
              user_id,
              provider,
              provider_user_id,
              provider_email,
              provider_username,
              last_used_at
            )
            VALUES (
              ?, ?, 'GOOGLE', ?, ?, ?,
              CURRENT_TIMESTAMP
            )`,
          )
          .bind(
            crypto.randomUUID(),
            linkingUser.id,
            googleUser.sub,
            email,
            googleUser.name ?? null,
          )
          .run();
      } else {
        await env.appkhor_db
          .prepare(
            `UPDATE auth_identities
            SET
              provider_email = ?,
              provider_username = ?,
              updated_at = CURRENT_TIMESTAMP,
              last_used_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
              AND provider = 'GOOGLE'`,
          )
          .bind(
            email,
            googleUser.name ?? null,
            linkingUser.id,
          )
          .run();
      }

      await env.appkhor_db
        .prepare(
          `UPDATE users
          SET
            display_name = COALESCE(?, display_name),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          googleUser.name ?? null,
          googleUser.picture ?? null,
          linkingUser.id,
        )
        .run();

      return redirectHome(
        appUrl,
        isHttps,
        true,
      );
    }

    let userId: string;

    if (existingIdentity) {
      if (existingIdentity.account_status !== "ACTIVE") {
        return redirectToAuth(
          appUrl,
          "account_inactive",
          isHttps,
        );
      }

      userId = existingIdentity.user_id;

      await env.appkhor_db.batch([
        env.appkhor_db
          .prepare(
            `UPDATE auth_identities
            SET
              provider_email = ?,
              provider_username = ?,
              updated_at = CURRENT_TIMESTAMP,
              last_used_at = CURRENT_TIMESTAMP
            WHERE provider = 'GOOGLE'
              AND provider_user_id = ?`,
          )
          .bind(
            email,
            googleUser.name ?? null,
            googleUser.sub,
          ),

        env.appkhor_db
          .prepare(
            `UPDATE users
            SET
              display_name = COALESCE(?, display_name),
              avatar_url = COALESCE(?, avatar_url),
              last_login_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
          )
          .bind(
            googleUser.name ?? null,
            googleUser.picture ?? null,
            userId,
          ),
      ]);
    } else {
      const existingEmailUser = await env.appkhor_db
        .prepare(
          `SELECT id
          FROM users
          WHERE primary_email = ?
             OR email = ?
          LIMIT 1`,
        )
        .bind(email, email)
        .first<ExistingEmailUser>();

      if (existingEmailUser) {
        return redirectToAuth(
          appUrl,
          "email_already_registered",
          isHttps,
        );
      }

      userId = crypto.randomUUID();

      const identityId = crypto.randomUUID();

      const legacyPasswordMarker =
        `google_oauth_only:${randomToken(32)}`;

      await env.appkhor_db.batch([
        env.appkhor_db
          .prepare(
            `INSERT INTO users (
              id,
              email,
              password_hash,
              role,
              is_active,
              email_verified_at,
              primary_email,
              display_name,
              avatar_url,
              account_role,
              account_status,
              last_login_at
            )
            VALUES (
              ?, ?, ?, 'user', 1,
              CURRENT_TIMESTAMP,
              ?, ?, ?,
              'USER', 'ACTIVE',
              CURRENT_TIMESTAMP
            )`,
          )
          .bind(
            userId,
            email,
            legacyPasswordMarker,
            email,
            googleUser.name ?? null,
            googleUser.picture ?? null,
          ),

        env.appkhor_db
          .prepare(
            `INSERT INTO auth_identities (
              id,
              user_id,
              provider,
              provider_user_id,
              provider_email,
              provider_username,
              last_used_at
            )
            VALUES (
              ?, ?, 'GOOGLE', ?, ?, ?,
              CURRENT_TIMESTAMP
            )`,
          )
          .bind(
            identityId,
            userId,
            googleUser.sub,
            email,
            googleUser.name ?? null,
          ),
      ]);
    }

    const sessionId = crypto.randomUUID();
    const sessionToken = randomToken(32);
    const sessionTokenHash =
      await hashToken(sessionToken);

    const sessionLifetimeSeconds =
      60 * 60 * 24 * 30;

    const expiresAt = new Date(
      Date.now() + sessionLifetimeSeconds * 1000,
    ).toISOString();

    const userAgent =
      request.headers.get("user-agent");

    await env.appkhor_db
      .prepare(
        `INSERT INTO sessions (
          id,
          user_id,
          token_hash,
          expires_at,
          user_agent,
          last_used_at
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      )
      .bind(
        sessionId,
        userId,
        sessionTokenHash,
        expiresAt,
        userAgent,
      )
      .run();

    const sessionCookie = cookieHeader(
      "appkhor_session",
      sessionToken,
      sessionLifetimeSeconds,
      isHttps,
    );

    return new Response(null, {
      status: 302,
      headers: [
       ["Location", new URL("/auth/enter", appUrl).toString()],
        ["Set-Cookie", sessionCookie],
        ["Set-Cookie", clearGoogleStateCookie(isHttps)],
        ["Set-Cookie", clearGoogleModeCookie(isHttps)],
      ],
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error);

    return redirectToAuth(
      appUrl,
      "unexpected_error",
      isHttps,
    );
  }
}