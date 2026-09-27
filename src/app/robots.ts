import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/auth",
          "/admin",
          "/superadmin",
          "/go/",
          "/search",
          "/register",
        ],
      },
    ],
    sitemap: "https://appkhor.ir/sitemap.xml",
    host: "https://appkhor.ir",
  };
}
