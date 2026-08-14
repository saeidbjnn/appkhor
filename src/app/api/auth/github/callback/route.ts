import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

type GitHubTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

type ExistingGitHubIdentity = {
  user_id: string;
  account_status: string;
};

type ExistingEmailUser = {
  id: string;
  account_status: string;
};

type CurrentSessionUser = {
  id: string;
  account_status: string;
};

type UserGitHubIdentity = {
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

function createCookie(
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

function clearStateCookie(isHttps: boolean): string {
  return createCookie(
    "appkhor_github_oauth_state",
    "",
    0,
    isHttps,
  );
}

function clearVerifierCookie(isHttps: boolean): string {
  return createCookie(
    "appkhor_github_oauth_verifier",
    "",
    0,
    isHttps,
  );
}

function clearModeCookie(isHttps: boolean): string {
  return createCookie(
    "appkhor_github_oauth_mode",
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
  url.searchParams.set("github_error", reason);

  return new Response(null, {
    status: 302,
    headers: [
      ["Location", url.toString()],
      ["Set-Cookie", clearStateCookie(isHttps)],
      ["Set-Cookie", clearVerifierCookie(isHttps)],
      ["Set-Cookie", clearModeCookie(isHttps)],
    ],
  });
}

function redirectAfterLink(
  appUrl: string,
  isHttps: boolean,
): Response {
  const url = new URL("/", appUrl);
  url.searchParams.set("github_linked", "1");

  return new Response(null, {
    status: 302,
    headers: [
      ["Location", url.toString()],
      ["Set-Cookie", clearStateCookie(isHttps)],
      ["Set-Cookie", clearVerifierCookie(isHttps)],
      ["Set-Cookie", clearModeCookie(isHttps)],
    ],
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const isHttps = requestUrl.protocol === "https:";

  const { env } = getCloudflareContext();

  const githubEnv = env as typeof env & {
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    APP_URL?: string;
  };

  if (
    !githubEnv.GITHUB_CLIENT_ID ||
    !githubEnv.GITHUB_CLIENT_SECRET ||
    !githubEnv.APP_URL
  ) {
    return Response.json(
      {
        success: false,
        message: "تنظیمات ورود با گیت‌هاب کامل نیست.",
      },
      { status: 500 },
    );
  }

  const appUrl = githubEnv.APP_URL;

  try {
    if (requestUrl.searchParams.get("error")) {
      return redirectToAuth(
        appUrl,
        "cancelled",
        isHttps,
      );
    }

    const code = requestUrl.searchParams.get("code");
    const returnedState =
      requestUrl.searchParams.get("state");

    const storedState = getCookie(
      request,
      "appkhor_github_oauth_state",
    );

    const codeVerifier = getCookie(
      request,
      "appkhor_github_oauth_verifier",
    );

    const isLinkMode =
      getCookie(
        request,
        "appkhor_github_oauth_mode",
      ) === "link";

    if (
      !code ||
      !returnedState ||
      !storedState ||
      !codeVerifier ||
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

      const sessionTokenHash =
        await hashToken(sessionToken);

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
      `${appUrl}/api/auth/github/callback`;

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: githubEnv.GITHUB_CLIENT_ID,
          client_secret:
            githubEnv.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      },
    );

    if (!tokenResponse.ok) {
      console.error(
        "GitHub token exchange failed:",
        await tokenResponse.text(),
      );

      return redirectToAuth(
        appUrl,
        "token_exchange_failed",
        isHttps,
      );
    }

    const tokenData =
      (await tokenResponse.json()) as GitHubTokenResponse;

    if (
      tokenData.error ||
      !tokenData.access_token
    ) {
      console.error(
        "GitHub OAuth token error:",
        tokenData.error,
        tokenData.error_description,
      );

      return redirectToAuth(
        appUrl,
        "token_exchange_failed",
        isHttps,
      );
    }

    const githubHeaders = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "X-GitHub-Api-Version": "2026-03-10",
      "User-Agent": "AppKhor",
    };

    const userResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: githubHeaders,
      },
    );

    if (!userResponse.ok) {
      console.error(
        "GitHub user fetch failed:",
        await userResponse.text(),
      );

      return redirectToAuth(
        appUrl,
        "userinfo_failed",
        isHttps,
      );
    }

    const githubUser =
      (await userResponse.json()) as GitHubUser;

    if (
      !githubUser.id ||
      !githubUser.login
    ) {
      return redirectToAuth(
        appUrl,
        "invalid_github_account",
        isHttps,
      );
    }

    const emailsResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: githubHeaders,
      },
    );

    if (!emailsResponse.ok) {
      console.error(
        "GitHub emails fetch failed:",
        await emailsResponse.text(),
      );

      return redirectToAuth(
        appUrl,
        "email_unavailable",
        isHttps,
      );
    }

    const githubEmails =
      (await emailsResponse.json()) as GitHubEmail[];

    const primaryVerifiedEmail =
      githubEmails.find(
        (item) =>
          item.primary &&
          item.verified,
      ) ??
      githubEmails.find(
        (item) => item.verified,
      );

    if (!primaryVerifiedEmail) {
      return redirectToAuth(
        appUrl,
        "verified_email_required",
        isHttps,
      );
    }

    const email =
      primaryVerifiedEmail.email
        .trim()
        .toLowerCase();

    const providerUserId =
      String(githubUser.id);

    const existingIdentity = await env.appkhor_db
      .prepare(
        `SELECT
          auth_identities.user_id,
          users.account_status
        FROM auth_identities
        INNER JOIN users
          ON users.id = auth_identities.user_id
        WHERE auth_identities.provider = 'GITHUB'
          AND auth_identities.provider_user_id = ?
        LIMIT 1`,
      )
      .bind(providerUserId)
      .first<ExistingGitHubIdentity>();

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
          "github_already_linked_elsewhere",
          isHttps,
        );
      }

      const currentGitHubIdentity =
        await env.appkhor_db
          .prepare(
            `SELECT provider_user_id
            FROM auth_identities
            WHERE user_id = ?
              AND provider = 'GITHUB'
            LIMIT 1`,
          )
          .bind(linkingUser.id)
          .first<UserGitHubIdentity>();

      if (
        currentGitHubIdentity &&
        currentGitHubIdentity.provider_user_id !== providerUserId
      ) {
        return redirectToAuth(
          appUrl,
          "github_already_linked",
          isHttps,
        );
      }

      if (
        !existingIdentity &&
        !currentGitHubIdentity
      ) {
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
              ?, ?, 'GITHUB',
              ?, ?, ?,
              CURRENT_TIMESTAMP
            )`,
          )
          .bind(
            crypto.randomUUID(),
            linkingUser.id,
            providerUserId,
            email,
            githubUser.login,
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
              AND provider = 'GITHUB'`,
          )
          .bind(
            email,
            githubUser.login,
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
          githubUser.name ??
            githubUser.login,
          githubUser.avatar_url,
          linkingUser.id,
        )
        .run();

      return redirectAfterLink(
        appUrl,
        isHttps,
      );
    }

    let userId: string;

    if (existingIdentity) {
      if (
        existingIdentity.account_status !== "ACTIVE"
      ) {
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
            WHERE provider = 'GITHUB'
              AND provider_user_id = ?`,
          )
          .bind(
            email,
            githubUser.login,
            providerUserId,
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
            githubUser.name ??
              githubUser.login,
            githubUser.avatar_url,
            userId,
          ),
      ]);
    } else {
      const existingEmailUser =
        await env.appkhor_db
          .prepare(
            `SELECT
              id,
              account_status
            FROM users
            WHERE primary_email = ?
               OR email = ?
            LIMIT 1`,
          )
          .bind(email, email)
          .first<ExistingEmailUser>();

      if (existingEmailUser) {
        if (
          existingEmailUser.account_status !== "ACTIVE"
        ) {
          return redirectToAuth(
            appUrl,
            "account_inactive",
            isHttps,
          );
        }

        const existingUserGitHubIdentity =
          await env.appkhor_db
            .prepare(
              `SELECT provider_user_id
              FROM auth_identities
              WHERE user_id = ?
                AND provider = 'GITHUB'
              LIMIT 1`,
            )
            .bind(existingEmailUser.id)
            .first<UserGitHubIdentity>();

        if (
          existingUserGitHubIdentity &&
          existingUserGitHubIdentity.provider_user_id !== providerUserId
        ) {
          return redirectToAuth(
            appUrl,
            "github_already_linked",
            isHttps,
          );
        }

        userId = existingEmailUser.id;

        if (!existingUserGitHubIdentity) {
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
                ?, ?, 'GITHUB',
                ?, ?, ?,
                CURRENT_TIMESTAMP
              )`,
            )
            .bind(
              crypto.randomUUID(),
              userId,
              providerUserId,
              email,
              githubUser.login,
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
                AND provider = 'GITHUB'`,
            )
            .bind(
              email,
              githubUser.login,
              userId,
            )
            .run();
        }

        await env.appkhor_db
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
            githubUser.name ??
              githubUser.login,
            githubUser.avatar_url,
            userId,
          )
          .run();
      } else {
        userId = crypto.randomUUID();

        const identityId =
          crypto.randomUUID();

        const legacyPasswordMarker =
          `github_oauth_only:${randomToken(32)}`;

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
              githubUser.name ??
                githubUser.login,
              githubUser.avatar_url,
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
                ?, ?, 'GITHUB',
                ?, ?, ?,
                CURRENT_TIMESTAMP
              )`,
            )
            .bind(
              identityId,
              userId,
              providerUserId,
              email,
              githubUser.login,
            ),
        ]);
      }
    }

    const sessionId =
      crypto.randomUUID();

    const sessionToken =
      randomToken(32);

    const sessionTokenHash =
      await hashToken(sessionToken);

    const sessionLifetimeSeconds =
      60 * 60 * 24 * 30;

    const expiresAt = new Date(
      Date.now() +
        sessionLifetimeSeconds * 1000,
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
        VALUES (
          ?, ?, ?, ?, ?,
          CURRENT_TIMESTAMP
        )`,
      )
      .bind(
        sessionId,
        userId,
        sessionTokenHash,
        expiresAt,
        userAgent,
      )
      .run();

    const sessionCookie = createCookie(
      "appkhor_session",
      sessionToken,
      sessionLifetimeSeconds,
      isHttps,
    );

    return new Response(null, {
      status: 302,
      headers: [
        [
          "Location",
          new URL(
            "/auth/enter",
            appUrl,
          ).toString(),
        ],
        ["Set-Cookie", sessionCookie],
        [
          "Set-Cookie",
          clearStateCookie(isHttps),
        ],
        [
          "Set-Cookie",
          clearVerifierCookie(isHttps),
        ],
        [
          "Set-Cookie",
          clearModeCookie(isHttps),
        ],
      ],
    });
  } catch (error) {
    console.error(
      "GitHub OAuth callback error:",
      error,
    );

    return redirectToAuth(
      appUrl,
      "unexpected_error",
      isHttps,
    );
  }
}