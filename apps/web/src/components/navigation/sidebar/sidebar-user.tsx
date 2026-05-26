"use client";

import { Avatar } from "@/components/ui/primitives/avatar";
import { Skeleton } from "@/components/ui/primitives/skeleton";
import { useAppContext } from "@/context/app-context";
import { useUIContext } from "@/context/ui-context";
import { useEscape } from "@/hooks/useEscape";
import { useLogout } from "@/hooks/useLogout";
import { API_BASE_URL } from "@/utils/constants";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface SidebarUserProps {
  collapsed?: boolean;
}

export function SidebarUser({ collapsed }: SidebarUserProps) {
  const t = useTranslations("Sidebar");
  const { user, clearSession, isLoading } = useAppContext();
  const { openSettings } = useUIContext();
  const router = useRouter();
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

  return (
    <div className="relative">
      <div className="border-t border-stroke/60 mx-2 mb-2" />
      <div className="pt-1 px-1">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="user-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center h-11 px-3 gap-2"
            >
              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
              {!collapsed && (
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-2 w-28 rounded-full" />
                </div>
              )}
            </motion.div>
          ) : user ? (
            <motion.div
              key="user-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence>
                {isOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute bottom-full left-0 z-modal mb-2 w-52 rounded-xl border border-stroke bg-canvas p-1.5 shadow-lg shadow-black/5"
                    >
                      <div className="px-2 py-1.5 mb-1.5 border-b border-stroke">
                        <p className="text-sm font-semibold text-ink truncate">{user.username}</p>
                        <p className="text-xs text-ink-muted truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push("/profile");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-ink-secondary hover:bg-surface hover:text-ink transition-colors cursor-pointer"
                      >
                        <UserIcon size={14} />
                        {t("profile")}
                      </button>

                      <button
                        onClick={() => {
                          setIsOpen(false);
                          openSettings();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-ink-secondary hover:bg-surface hover:text-ink transition-colors cursor-pointer"
                      >
                        <Settings size={14} />
                        {t("settings")}
                      </button>

                      <div className="my-1 border-t border-stroke" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        {t("logOut")}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsOpen((v) => !v)}
                className={`flex w-full items-center h-11 px-3 rounded-xl transition-all duration-150 group ${
                  isOpen ? "bg-surface" : "hover:bg-surface"
                }`}
              >
                <div className="w-6 shrink-0 flex items-center justify-center">
                  <Avatar
                    initial={user.username[0] ?? ""}
                    image={user.icon ? `${API_BASE_URL}${user.icon}` : null}
                    size="sm"
                  />
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left overflow-hidden ml-2">
                    <p className="text-sm font-semibold text-ink truncate leading-tight">{user.username}</p>
                    <p className="text-xs text-ink-muted truncate whitespace-nowrap">{user.email}</p>
                  </div>
                )}
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
