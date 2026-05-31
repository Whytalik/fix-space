import type { Metadata } from "next";
import { Sidebar } from "@/components/navigation/sidebar/sidebar";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fix-space-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
