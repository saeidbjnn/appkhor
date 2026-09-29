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
      alternates: {
        languages: {
          fa: baseUrl,
          en: baseUrl + "/en",
        },
      },
    },
    {
      url: baseUrl + "/en",
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          fa: baseUrl,
          en: baseUrl + "/en",
        },
      },
    },
    {
      url: baseUrl + "/apps",
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          fa: baseUrl + "/apps",
          en: baseUrl + "/en/apps",
        },
      },
    },
    {
      url: baseUrl + "/en/apps",
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          fa: baseUrl + "/apps",
          en: baseUrl + "/en/apps",
        },
      },
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
      (result.results ?? []).flatMap((app) => {
        const encodedSlug =
          encodeURIComponent(app.slug);

        const faUrl =
          baseUrl + "/apps/" + encodedSlug;

        const enUrl =
          baseUrl + "/en/apps/" + encodedSlug;

        const shared = {
          lastModified:
            app.published_at ?? undefined,
          changeFrequency:
            "weekly" as const,
          priority: 0.8,
          alternates: {
            languages: {
              fa: faUrl,
              en: enUrl,
            },
          },
        };

        return [
          {
            url: faUrl,
            ...shared,
          },
          {
            url: enUrl,
            ...shared,
          },
        ];
      });

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
