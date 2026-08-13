import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

function getCookieValue(cookieHeader: string | null, name: string) {
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

export async function POST(request: Request) {
  try {
    const sessionToken = getCookieValue(
      request.headers.get("cookie"),
      "appkhor_session",
    );

    if (sessionToken) {
      const tokenHash = await hashToken(sessionToken);
      const { env } = getCloudflareContext();

      await env.appkhor_db
        .prepare(
          `DELETE FROM sessions
          WHERE token_hash = ?`,
        )
        .bind(tokenHash)
        .run();
    }

    const isHttps = new URL(request.url).protocol === "https:";

    const cookie = [
      "appkhor_session=",
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=0",
      isHttps ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    return Response.json(
      {
        success: true,
        message: "با موفقیت از حساب خارج شدید.",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      },
    );
  } catch (error) {
    console.error("Logout error:", error);

    return Response.json(
      {
        success: false,
        message: "در خروج از حساب مشکلی پیش آمد.",
      },
      { status: 500 },
    );
  }
}