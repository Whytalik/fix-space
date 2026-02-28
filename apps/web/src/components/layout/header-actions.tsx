"use client";

import { useAppContext } from "@/context/app-context";
import { logout } from "@/lib/api/auth";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AUTH_PAGES = ["/login", "/register"];

export function HeaderActions() {
  const pathname = usePathname();
  const { user, isLoading, clearSession } = useAppContext();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (AUTH_PAGES.includes(pathname)) return null;
  if (isLoading) return <div className="w-24 h-7 rounded-lg bg-surface animate-pulse" />;

  async function handleLogout() {
    setIsOpen(false);
    await logout().catch(() => {});
    clearSession();
    router.push("/login");
  }

  return (
    <div className="flex items-center">
      {user ? (
        <>
          {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
          <div className="relative z-50 flex items-center">
            {/* Options slide in from the right, appearing to the left of the trigger */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-200 ease-out ${
                isOpen ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 text-[13px] font-medium text-ink-secondary hover:text-ink transition-colors"
              >
                <User size={13} />
                Profile
              </Link>
              <span className="text-stroke">|</span>
              <button
                onClick={handleLogout}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 text-[13px] font-medium text-ink-secondary hover:text-ink transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                Log out
              </button>
              <span className="mx-2 text-stroke">|</span>
            </div>

            {/* Trigger: avatar + username, always visible on the right */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface transition-colors cursor-pointer shrink-0"
            >
              <div className="flex items-center justify-center w-7.5 h-7.5 rounded-full bg-accent-muted border border-accent text-xs font-bold text-accent shrink-0">
                {user.username[0]?.toUpperCase()}
              </div>
              <span className="text-[13.5px] font-semibold text-ink-secondary">{user.username}</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="px-3.5 py-1.75 rounded-lg text-[13.5px] font-semibold text-ink-secondary border border-stroke transition-all duration-150 hover:text-ink hover:border-ink-muted"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.75 rounded-lg text-[13.5px] font-semibold text-white bg-accent shadow-accent transition-colors duration-150 hover:bg-accent-hover"
          >
            Get started
          </Link>
        </>
      )}
    </div>
  );
}
