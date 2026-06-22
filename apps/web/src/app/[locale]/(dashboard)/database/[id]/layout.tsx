"use client";

import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useAppContext } from "@/context/app-context";
import { DatabaseProvider } from "@/context/database-context";

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return <PageLoader className="flex-1 bg-canvas" />;
  }

  return (
    <DatabaseProvider>
      <div className="flex-1 flex flex-col min-h-0 relative">
        <main className="flex-1 flex flex-col overflow-hidden relative">{children}</main>
      </div>
    </DatabaseProvider>
  );
}
