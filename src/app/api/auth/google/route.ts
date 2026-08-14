import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request) {
  const { env } = getCloudflareContext();

  const googleEnv = env as typeof env & {
    GOOGLE_CLIENT_ID?: string;
    APP_URL?: string;
  };

  if (!googleEnv.GOOGLE_CLIENT_ID || !googleEnv.APP_URL) {
    return Response.json(
      {
        success: false,
        message: "تنظیمات ورود با گوگل کامل نیست.",
      },
      { status: 500 },
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

  return new Response(null, {
    status: 302,
    headers: {
      Location: googleUrl.toString(),
      "Set-Cookie": stateCookie,
    },
  });
}