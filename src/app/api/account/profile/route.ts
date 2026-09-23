import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "nodejs";

type SessionUserRow = {
  id: string;
};

function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [key, ...valueParts] =
      cookie.trim().split("=");

    if (key === name) {
      return valueParts.join("=") || null;
    }
  }

  return null;
}

async function hashToken(
  token: string,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) =>
      byte.toString(16).padStart(2, "0"),
    )
    .join("");
}

export async function PATCH(request: Request) {
  try {
    const sessionToken = getCookieValue(
      request.headers.get("cookie"),
      "appkhor_session",
    );

    if (!sessionToken) {
      return Response.json(
        {
          success: false,
          message:
            "\u0644\u0637\u0641\u0627\u064b \u0627\u0628\u062a\u062f\u0627 \u0648\u0627\u0631\u062f \u062d\u0633\u0627\u0628 \u0634\u0648\u06cc\u062f.",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      displayName?: unknown;
    };

    if (typeof body.displayName !== "string") {
      return Response.json(
        {
          success: false,
          message:
            "\u0646\u0627\u0645 \u0646\u0645\u0627\u06cc\u0634\u06cc \u0645\u0639\u062a\u0628\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 400 },
      );
    }

    const displayName =
      body.displayName.trim();

    if (displayName.length > 60) {
      return Response.json(
        {
          success: false,
          message:
            "\u0646\u0627\u0645 \u0646\u0645\u0627\u06cc\u0634\u06cc \u0646\u0628\u0627\u06cc\u062f \u0628\u06cc\u0634 \u0627\u0632 \u06f6\u06f0 \u0646\u0648\u06cc\u0633\u0647 \u0628\u0627\u0634\u062f.",
        },
        { status: 400 },
      );
    }

    const tokenHash =
      await hashToken(sessionToken);

    const { env } = getCloudflareContext();

    const user = await env.appkhor_db
      .prepare(
        `SELECT users.id
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?
          AND sessions.expires_at >
            CURRENT_TIMESTAMP
          AND users.account_status = 'ACTIVE'
        LIMIT 1`,
      )
      .bind(tokenHash)
      .first<SessionUserRow>();

    if (!user) {
      return Response.json(
        {
          success: false,
          message:
            "\u0646\u0634\u0633\u062a \u0634\u0645\u0627 \u0645\u0639\u062a\u0628\u0631 \u0646\u06cc\u0633\u062a.",
        },
        { status: 401 },
      );
    }

    await env.appkhor_db
      .prepare(
        `UPDATE users
        SET display_name = ?
        WHERE id = ?`,
      )
      .bind(
        displayName || null,
        user.id,
      )
      .run();

    return Response.json({
      success: true,
      displayName:
        displayName || null,
      message:
        "\u0646\u0627\u0645 \u0646\u0645\u0627\u06cc\u0634\u06cc \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f.",
    });
  } catch (error) {
    console.error(
      "Update account profile error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "\u062f\u0631 \u0630\u062e\u06cc\u0631\u0647 \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u062d\u0633\u0627\u0628 \u0645\u0634\u06a9\u0644\u06cc \u067e\u06cc\u0634 \u0622\u0645\u062f.",
      },
      { status: 500 },
    );
  }
}