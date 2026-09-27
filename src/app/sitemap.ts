import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MetadataRoute } from "next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AppRow = {
  slug: string;
  published_at: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://appkhor.ir";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: baseUrl + "/apps",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: baseUrl + "/categories",
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const { env } = getCloudflareContext();

    const result = await env.appkhor_db
      .prepare(
        `SELECT
          slug,
          published_at
        FROM apps
        WHERE status = 'PUBLISHED'
        ORDER BY
          CASE
            WHEN published_at IS NULL
            THEN 1
            ELSE 0
          END,
          published_at DESC`,
      )
      .all<AppRow>();

    const appEntries: MetadataRoute.Sitemap =
      (result.results ?? []).map((app) => ({
        url:
          baseUrl +
          "/apps/" +
          encodeURIComponent(app.slug),
        lastModified:
          app.published_at ?? undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    return [
      ...staticEntries,
      ...appEntries,
    ];
  } catch (error) {
    console.error(
      "Sitemap generation error:",
      error,
    );

    return staticEntries;
  }
}
