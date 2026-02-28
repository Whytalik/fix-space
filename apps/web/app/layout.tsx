import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AppProvider } from "@/context/app-context";
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
      <body className={`${GeistSans.className} min-h-screen flex flex-col`}>
        <AppProvider>
          <Header />
          <main className="flex flex-col flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
