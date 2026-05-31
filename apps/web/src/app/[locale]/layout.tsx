import { QueryProvider } from "@/components/providers/query-provider";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { ErrorModalShell } from "@/components/ui/primitives/feedback/error-modal-shell";
import { AppProvider } from "@/context/app-context";
import { ThemeProvider } from "@/context/theme-context";
import { UIProvider } from "@/context/ui-context";
import { routing } from "@/i18n/routing";
import { getMeServer } from "@/lib/auth-server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "reflect-metadata";
import "../globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fix-space-web.vercel.app";
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(baseUrl),
    title: { default: title, template: `%s | FIX Space` },
    description,
    icons: { icon: "/favicon.svg" },
    openGraph: {
      type: "website",
      url: `${baseUrl}/${locale}`,
      title,
      description,
      images: [{ url: `${baseUrl}/opengraph-image.png`, width: 1200, height: 630, alt: "FIX Space" }],
      locale: locale === "uk" ? "uk_UA" : "en_US",
      siteName: "FIX Space",
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: { en: `${baseUrl}/en`, uk: `${baseUrl}/uk` },
    },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const user = await getMeServer();

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-canvas text-ink h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AppProvider initialUser={user}>
              <ThemeProvider>
                <UIProvider>
                  <main className="flex flex-col flex-1 min-h-0 overflow-hidden">{children}</main>
                  <SettingsShell />
                  <ErrorModalShell />
                </UIProvider>
              </ThemeProvider>
            </AppProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
