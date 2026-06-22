import { APP_URL } from "@/utils/app-url";
import type { MetadataRoute } from "next";

const locales = ["en", "uk"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${APP_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: {
      languages: Object.fromEntries(locales.map((locale) => [locale, `${APP_URL}/${locale}`])),
    },
  }));
}
