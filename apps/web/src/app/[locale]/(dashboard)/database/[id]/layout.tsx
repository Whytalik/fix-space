"use client";

import { useAppContext } from "@/context/app-context";
import { DatabaseProvider } from "@/context/database-context";

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <DatabaseProvider>
      <div className="flex-1 flex flex-col min-h-0 relative">
        <main className="flex-1 overflow-hidden relative">{children}</main>
      </div>
    </DatabaseProvider>
  );
}
