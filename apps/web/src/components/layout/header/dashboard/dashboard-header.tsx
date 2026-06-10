"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Search, Bell, LogOut, Settings } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { useUIContext } from "@/context/ui-context";
import { useLogout } from "@/hooks/auth/use-logout";
import { useEscape } from "@/hooks/ui/use-escape";
import { useClickOutside } from "@/hooks/ui/use-click-outside";
import { Avatar } from "@/components/ui/primitives/display/avatar";
import { Logo } from "@/components/ui/brand/logo";
import { useTranslations } from "next-intl";
import { SearchModal } from "./search-modal";
import { NotificationsModal } from "./notifications-modal";
import { DashboardHeaderSkeleton } from "./skeletons/dashboard-header-skeleton";
import { useUnreadCountQuery } from "@/hooks/api/use-notifications-query";

export function DashboardHeader() {
  const t = useTranslations("Header");
  const { user, isLoading } = useAppContext();
  const { data: unreadData } = useUnreadCountQuery();
  const { openSettings } = useUIContext();
  const logout = useLogout();
  const menuRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const closeMenu = useCallback(() => setUserMenuOpen(false), []);

  useEscape(closeMenu);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useClickOutside(menuRef, closeMenu);

  async function handleLogout() {
    setUserMenuOpen(false);
    await logout();
  }

  if (isLoading) return <DashboardHeaderSkeleton />;
  if (!user) return null;

  const unreadCount = unreadData?.count ?? 0;

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-stroke bg-canvas/85 backdrop-blur-md select-none">
      <div className="w-60 shrink-0 flex items-center gap-2 px-4 h-full">
        <Logo size={28} href="/" />
      </div>
      <div className="flex flex-1 items-center justify-between px-6 min-w-0">
        <div className="flex items-center min-w-0">
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title={t("search") || "Search"}
            className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors duration-150 cursor-pointer"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            title={t("notifications") || "Notifications"}
            className="relative p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors duration-150 cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <span className="h-4 w-px bg-stroke" />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface transition-colors duration-150 cursor-pointer shrink-0"
            >
              <Avatar initial={user.username[0] ?? ""} image={user.icon ?? null} size="sm" />
              <div className="text-left">
                <span className="text-sm font-medium text-ink leading-tight block">{user.username}</span>
                <span className="type-hint leading-tight block truncate">{user.email}</span>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute left-0 right-0 mt-2 origin-top rounded-2xl border border-stroke bg-elevated py-1.5 z-40 animate-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    openSettings();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 type-menu-item hover:text-ink hover:bg-surface transition-colors duration-150 cursor-pointer"
                >
                  <Settings size={14} />
                  <span>{t("settings")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-error hover:bg-error-bg transition-colors duration-150 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{t("logOut")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {notificationsOpen && <NotificationsModal onClose={() => setNotificationsOpen(false)} />}
    </header>
  );
}
