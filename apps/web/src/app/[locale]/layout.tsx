import "reflect-metadata";
import ReflectPolyfill from "../_reflect-polyfill";
import { SettingsShell } from "@/components/settings/settings-shell";
import { ErrorModalShell } from "@/components/ui/primitives/error-modal-shell";
import { AppProvider } from "@/context/app-context";
import { ThemeProvider } from "@/context/theme-context";
import { UIProvider } from "@/context/ui-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { getMeServer } from "@/lib/auth-server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "../globals.css";

export const metadata: Metadata = {
  title: "FIX Space",
  description: "A modern trading workspace for your better performance.",
  icons: {
    icon: "/favicon.svg",
  },
};

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

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const user = await getMeServer();

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <ReflectPolyfill />
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
      </body>
    </html>
  );
}
