"use client";

import { useAppContext } from "@/context/app-context";
import { DatabaseProvider } from "@/context/database-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return <DatabaseProvider>{children}</DatabaseProvider>;
}
