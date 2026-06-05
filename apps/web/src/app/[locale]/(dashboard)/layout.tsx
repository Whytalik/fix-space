import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { DashboardHeader } from "@/components/layout/header/dashboard/dashboard-header";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fix-space-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-canvas overflow-hidden">
      <DashboardHeader />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
