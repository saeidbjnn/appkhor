import { getCloudflareContext } from "@opennextjs/cloudflare";

type MediaAssetRow = {
  content_type: string;
  byte_size: number;
  data: number[];
};

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } = await context.params;

  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  const { env } = getCloudflareContext();

  const asset = await env.appkhor_db
    .prepare(
      `SELECT content_type, byte_size, data
       FROM media_assets
       WHERE id = ?
       LIMIT 1`,
    )
    .bind(id)
    .first<MediaAssetRow>();

  if (!asset || !Array.isArray(asset.data)) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = new Uint8Array(asset.data);

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": asset.content_type,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
