import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_LOGO_SIZE = 1 * 1024 * 1024;
const MAX_SCREENSHOT_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSuperadminSession();

  if (!session) {
    return Response.json(
      {
        success: false,
        message: "?????? ??????? ???.",
      },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const kind = formData.get("kind");

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "???? ????? ????? ???? ???.",
        },
        { status: 400 },
      );
    }

    if (kind !== "LOGO" && kind !== "SCREENSHOT") {
      return Response.json(
        {
          success: false,
          message: "??? ????? ????? ????.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        {
          success: false,
          message: "??? JPEG? PNG? WebP ?? AVIF ???? ???.",
        },
        { status: 400 },
      );
    }

    const maxSize =
      kind === "LOGO"
        ? MAX_LOGO_SIZE
        : MAX_SCREENSHOT_SIZE;

    if (file.size <= 0 || file.size > maxSize) {
      return Response.json(
        {
          success: false,
          message:
            kind === "LOGO"
              ? "??? ???? ???? ?????? ? ??????? ????."
              : "??? Screenshot ???? ?????? ? ??????? ????.",
        },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const { env } = getCloudflareContext();

    await env.appkhor_db
      .prepare(
        `INSERT INTO media_assets (
          id,
          kind,
          original_filename,
          content_type,
          byte_size,
          data
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        kind,
        file.name || null,
        file.type,
        file.size,
        bytes,
      )
      .run();

    return Response.json({
      success: true,
      asset: {
        id,
        kind,
        url: `/media/${id}`,
        contentType: file.type,
        byteSize: file.size,
      },
    });
  } catch (error) {
    console.error("Superadmin media upload failed:", error);

    return Response.json(
      {
        success: false,
        message: "????? ????? ????? ???.",
      },
      { status: 500 },
    );
  }
}
