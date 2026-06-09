"use client";

import { Avatar } from "@/components/ui/primitives/display/avatar";
import { Skeleton } from "@/components/ui/primitives/display/skeleton";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/ui/use-escape";
import { useLogout } from "@/hooks/auth/use-logout";
import { API_BASE_URL } from "@/utils/constants";
import { LogOut } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

interface SidebarUserProps {
  collapsed?: boolean;
}

export function SidebarUser({ collapsed }: SidebarUserProps) {
  const t = useTranslations("Sidebar");
  const { user, clearSession, isLoading } = useAppContext();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  useEscape(
    useCallback(() => {
      if (isOpen) setIsOpen(false);
    }, [isOpen]),
  );

  async function handleLogout() {
    setIsOpen(false);
    clearSession();
    await logout();
  }

  if (isLoading) {
    return (
      <div className="flex items-center h-11 px-3 gap-2">
        <Skeleton className="w-6 h-6 rounded-full shrink-0" />
        {!collapsed && (
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-2 w-28 rounded-full" />
          </div>
        )}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative">
      <div className="border-t border-stroke/60 mx-2 mb-2" />
      <div className="pt-1 px-1">
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-2xl border border-stroke bg-elevated p-1.5 animate-dropdown">
              <div className="px-2 py-1.5 mb-1.5 border-b border-stroke">
                <p className="text-sm font-semibold text-ink truncate">{user.username}</p>
                <p className="text-xs text-ink-muted truncate">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-error hover:bg-error-bg transition-colors duration-150 cursor-pointer"
              >
                <LogOut size={14} />
                {t("logOut")}
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex w-full items-center h-11 px-3 rounded-lg transition-colors duration-150 group ${
            isOpen ? "bg-surface" : "hover:bg-surface"
          }`}
        >
          <div className="w-6 shrink-0 flex items-center justify-center">
            <Avatar initial={user.username[0] ?? ""} image={user.icon ? `${API_BASE_URL}${user.icon}` : null} size="sm" />
          </div>
          {!collapsed && (
            <div className="flex-1 text-left overflow-hidden ml-2">
              <p className="text-sm font-semibold text-ink truncate leading-tight">{user.username}</p>
              <p className="text-xs text-ink-muted truncate whitespace-nowrap">{user.email}</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
