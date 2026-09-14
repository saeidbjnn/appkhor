import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

import { getSuperadminSession } from "@/lib/auth/get-superadmin-session";
import SuperadminMediaClient from "./superadmin-media-client";

export type SuperadminMediaAsset = {
  id: string;
  kind: "LOGO" | "SCREENSHOT";
  originalFilename: string | null;
  contentType: string;
  byteSize: number;
  createdAt: string;
  isReferenced: boolean;
  url: string;
};

export type SuperadminMediaStats = {
  totalAssets: number;
  totalBytes: number;
  logos: number;
  screenshots: number;
  orphanAssets: number;
  orphanBytes: number;
};

type StatsRow = {
  total_assets: number;
  total_bytes: number;
  logos: number;
  screenshots: number;
  orphan_assets: number;
  orphan_bytes: number;
};

type MediaRow = {
  id: string;
  kind: "LOGO" | "SCREENSHOT";
  original_filename: string | null;
  content_type: string;
  byte_size: number;
  created_at: string;
  is_referenced: number;
};

export default async function SuperadminMediaPage() {
  const session = await getSuperadminSession();

  if (!session) {
    redirect("/superadmin");
  }

  const { env } = getCloudflareContext();

  const [statsRow, mediaResult] =
    await Promise.all([
      env.appkhor_db
        .prepare(
          `SELECT
            COUNT(*) AS total_assets,
            COALESCE(SUM(byte_size), 0) AS total_bytes,
            COALESCE(SUM(
              CASE WHEN kind = 'LOGO'
              THEN 1 ELSE 0 END
            ), 0) AS logos,
            COALESCE(SUM(
              CASE WHEN kind = 'SCREENSHOT'
              THEN 1 ELSE 0 END
            ), 0) AS screenshots,
            COALESCE(SUM(
              CASE
                WHEN NOT EXISTS (
                  SELECT 1
                  FROM apps a
                  WHERE a.logo_url LIKE
                    '%/media/' || media_assets.id
                )
                AND NOT EXISTS (
                  SELECT 1
                  FROM app_screenshots s
                  WHERE s.image_url LIKE
                    '%/media/' || media_assets.id
                )
                THEN 1
                ELSE 0
              END
            ), 0) AS orphan_assets,
            COALESCE(SUM(
              CASE
                WHEN NOT EXISTS (
                  SELECT 1
                  FROM apps a
                  WHERE a.logo_url LIKE
                    '%/media/' || media_assets.id
                )
                AND NOT EXISTS (
                  SELECT 1
                  FROM app_screenshots s
                  WHERE s.image_url LIKE
                    '%/media/' || media_assets.id
                )
                THEN byte_size
                ELSE 0
              END
            ), 0) AS orphan_bytes
          FROM media_assets`,
        )
        .first<StatsRow>(),

      env.appkhor_db
        .prepare(
          `SELECT
            m.id,
            m.kind,
            m.original_filename,
            m.content_type,
            m.byte_size,
            m.created_at,
            CASE
              WHEN EXISTS (
                SELECT 1
                FROM apps a
                WHERE a.logo_url LIKE
                  '%/media/' || m.id
              )
              OR EXISTS (
                SELECT 1
                FROM app_screenshots s
                WHERE s.image_url LIKE
                  '%/media/' || m.id
              )
              THEN 1
              ELSE 0
            END AS is_referenced
          FROM media_assets m
          ORDER BY m.created_at DESC
          LIMIT 250`,
        )
        .all<MediaRow>(),
    ]);

  const stats: SuperadminMediaStats = {
    totalAssets: Number(
      statsRow?.total_assets ?? 0,
    ),
    totalBytes: Number(
      statsRow?.total_bytes ?? 0,
    ),
    logos: Number(
      statsRow?.logos ?? 0,
    ),
    screenshots: Number(
      statsRow?.screenshots ?? 0,
    ),
    orphanAssets: Number(
      statsRow?.orphan_assets ?? 0,
    ),
    orphanBytes: Number(
      statsRow?.orphan_bytes ?? 0,
    ),
  };

  const assets: SuperadminMediaAsset[] =
    (mediaResult.results ?? []).map(
      (asset) => ({
        id: asset.id,
        kind: asset.kind,
        originalFilename:
          asset.original_filename,
        contentType: asset.content_type,
        byteSize: Number(
          asset.byte_size ?? 0,
        ),
        createdAt: asset.created_at,
        isReferenced:
          asset.is_referenced === 1,
        url: `/media/${asset.id}`,
      }),
    );

  return (
    <SuperadminMediaClient
      email={session.email}
      stats={stats}
      assets={assets}
    />
  );
}
