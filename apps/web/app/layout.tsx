import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header/header";
import { SettingsShell } from "@/components/settings/settings-shell";
import { ErrorModalShell } from "@/components/ui/primitives/error-modal-shell";
import { AppProvider } from "@/context/app-context";
import { UIProvider } from "@/context/ui-context";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nucleus",
  description: "A modern trading workspace for your better performance.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} h-screen flex flex-col`}>
        <AppProvider>
          <UIProvider>
            <Header />
            <main className="flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar">{children}</main>
            <Footer />
            <SettingsShell />
            <ErrorModalShell />
          </UIProvider>
        </AppProvider>
      </body>
    </html>
  );
}
