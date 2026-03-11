"use client";

import { useAppContext } from "@/context/app-context";
import { DatabaseProvider } from "@/context/database-context";

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"></div>;
  }

  return <DatabaseProvider>{children}</DatabaseProvider>;
}
