import { APP_URL } from "@/utils/app-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/dashboard/", "/*/profile/", "/*/statistics/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
