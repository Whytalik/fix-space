import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixspace.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/dashboard/", "/*/profile/", "/*/statistics/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
