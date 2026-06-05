"use client";

import { Avatar } from "@/components/ui/primitives/display/avatar";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { useLogout } from "@/hooks/useLogout";
import { LogOut, User } from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const AUTH_PAGES = ["/login", "/register"];

export function HeaderActions() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { user, isLoading, clearSession } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;
  if (AUTH_PAGES.some((page) => pathname.endsWith(page))) return null;
  if (isLoading) return null;

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
          <div className="relative z-50 flex items-center">
            <div
              className={`flex items-center overflow-hidden transition-all duration-200 ease-out ${
                isOpen ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <Link
                href={"/profile"}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 text-sm font-medium text-ink-secondary hover:text-ink transition-colors cursor-pointer"
              >
                <User size={13} />
                {t("profile")}
              </Link>
              <span className="text-stroke">|</span>
              <button
                onClick={handleLogout}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 text-sm font-medium text-ink-secondary hover:text-ink transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                {t("logOut")}
              </button>
              <span className="mx-2 text-stroke">|</span>
            </div>

            <button
              onClick={() => setIsOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface transition-colors cursor-pointer shrink-0"
            >
              <Avatar initial={user.username[0] ?? ""} size="sm" />
              <span className="text-sm font-semibold text-ink-secondary">{user.username}</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="px-3.5 py-1.75 rounded-lg text-sm font-semibold text-ink-secondary border border-stroke transition-all duration-150 hover:text-ink hover:border-ink-muted"
          >
            {t("logIn")}
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.75 rounded-lg text-sm font-semibold text-white bg-accent shadow-accent transition-colors duration-150 hover:bg-accent-hover"
          >
            {t("getStarted")}
          </Link>
        </>
      )}
    </div>
  );
}
