import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://fix-space-web.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
