"use client";

import { logout } from "@/lib/api/auth";
import { storage } from "@/lib/storage";
import { useCallback } from "react";

export function useLogout() {
  return useCallback(async () => {
    await logout().catch(() => {});
    storage.clearLastSpaceId();
    window.location.href = "/login";
  }, []);
}
