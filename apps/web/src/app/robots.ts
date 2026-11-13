import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/*",
          "/admin",
          "/auth/confirmed",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: "https://web-omega-weld-89.vercel.app/sitemap.xml",
  };
}
