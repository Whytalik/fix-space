import type { MetadataRoute } from "next";

const locales = ["en", "uk"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixspace.app";

  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}`])),
    },
  }));
}
