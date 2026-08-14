import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
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

  return base64UrlEncode(new Uint8Array(digest));
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
        message: "تنظیمات ورود با گیت‌هاب کامل نیست.",
      },
      { status: 500 },
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
    ],
  });
}