import { APP_URL } from "@/utils/app-url";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar/sidebar";
import { DashboardHeader } from "@/components/layout/header/dashboard/dashboard-header";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get("sidebar-collapsed")?.value === "true";
  const collapsedSectionsValue = cookieStore.get("sidebar-collapsed-sections")?.value;
  let collapsedSections: string[] = [];

  if (collapsedSectionsValue) {
    try {
      collapsedSections = JSON.parse(decodeURIComponent(collapsedSectionsValue));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-canvas overflow-hidden">
      <DashboardHeader />
      <div className="flex flex-1 min-h-0">
        <Sidebar initialCollapsed={collapsed} initialCollapsedSections={collapsedSections} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
