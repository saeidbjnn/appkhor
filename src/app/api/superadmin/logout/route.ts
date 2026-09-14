import { getCloudflareContext } from "@opennextjs/cloudflare";

async function hashValue(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) =>
      byte.toString(16).padStart(2, "0"),
    )
    .join("");
}

function getCookieValue(
  request: Request,
  name: string,
): string | null {
  const cookieHeader =
    request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] =
      part.trim().split("=");

    if (rawName === name) {
      return decodeURIComponent(
        rawValue.join("="),
      );
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const sessionToken = getCookieValue(
      request,
      "appkhor_superadmin_session",
    );

    if (sessionToken) {
      const tokenHash =
        await hashValue(sessionToken);

      const { env } =
        getCloudflareContext();

      await env.appkhor_db
        .prepare(
          `DELETE FROM superadmin_sessions
          WHERE token_hash = ?`,
        )
        .bind(tokenHash)
        .run();
    }

    const secure =
      new URL(request.url).protocol ===
      "https:";

    const cookieParts = [
      "appkhor_superadmin_session=",
      "Path=/",
      "Max-Age=0",
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "HttpOnly",
      "SameSite=Strict",
    ];

    if (secure) {
      cookieParts.push("Secure");
    }

    return Response.json(
      {
        success: true,
      },
      {
        headers: {
          "Set-Cookie":
            cookieParts.join("; "),
        },
      },
    );
  } catch (error) {
    console.error(
      "Superadmin logout error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "\u062e\u0631\u0648\u062c \u0627\u0646\u062c\u0627\u0645 \u0646\u0634\u062f.",
      },
      { status: 500 },
    );
  }
}
