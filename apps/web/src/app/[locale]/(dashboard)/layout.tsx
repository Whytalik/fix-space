import { Sidebar } from "@/components/navigation/sidebar/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
