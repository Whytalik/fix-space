"use client";

import { logout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useLogout() {
  const router = useRouter();

  return useCallback(async () => {
    await logout().catch(() => {});
    router.push("/");
  }, [router]);
}
