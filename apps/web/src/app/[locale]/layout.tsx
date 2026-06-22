import { APP_URL } from "@/utils/app-url";
import { QueryProvider } from "@/components/providers/query-provider";
import { SettingsShell } from "@/components/settings/settings-shell";
import { ErrorModalShell } from "@/components/ui/primitives/feedback/error-modal-shell";
import { ToastShell } from "@/components/ui/primitives/feedback/toast-shell";
import { ConfirmShell } from "@/components/ui/overlays/confirm-shell";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { AppProvider } from "@/context/app-context";
import { ThemeProvider } from "@/context/theme-context";
import { UIProvider } from "@/context/ui-context";
import { routing } from "@/i18n/routing";
import { getMeServer } from "@/lib/auth-server";
import { getSpacesServer } from "@/lib/space-server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "reflect-metadata";
import "../globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(APP_URL),
    title: { default: title, template: `%s | FIX Space` },
    description,
    icons: { icon: "/favicon.svg" },
    openGraph: {
      type: "website",
      url: `${APP_URL}/${locale}`,
      title,
      description,
      images: [{ url: `${APP_URL}/opengraph-image.png`, width: 1200, height: 630, alt: "FIX Space" }],
      locale: locale === "uk" ? "uk_UA" : "en_US",
      siteName: "FIX Space",
    },
    alternates: {
      canonical: `${APP_URL}/${locale}`,
      languages: { en: `${APP_URL}/en`, uk: `${APP_URL}/uk` },
    },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const user = await getMeServer();
  const spaces = user ? await getSpacesServer() : [];
  const cookieStore = await cookies();
  const lastSpaceId = cookieStore.get("last_space_id")?.value;
  const initialSpaceId = lastSpaceId ?? spaces[0]?.id ?? null;

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);document.documentElement.classList.add(r);})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-canvas text-ink h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AppProvider initialUser={user} initialSpaces={spaces} initialSpaceId={initialSpaceId}>
              <ThemeProvider>
                <UIProvider>
                  <main className="flex flex-col flex-1 min-h-0 overflow-hidden">{children}</main>
                  <SettingsShell />
                  <ErrorModalShell />
                  <ToastShell />
                  <ConfirmShell />
                </UIProvider>
              </ThemeProvider>
            </AppProvider>
          </QueryProvider>
          <CookieBanner />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
