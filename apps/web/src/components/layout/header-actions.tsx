"use client";

import { useAppContext } from "@/context/app-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AUTH_PAGES = ["/login", "/register"];

export function HeaderActions() {
  const pathname = usePathname();
  const { user, isLoading } = useAppContext();

  if (AUTH_PAGES.includes(pathname)) return null;
  if (isLoading) return <div className="w-24 h-7 rounded-lg bg-surface animate-pulse" />;

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <div className="flex items-center gap-2">
          <div className="w-7.5 h-7.5 rounded-full bg-accent-muted border border-accent flex items-center justify-center text-xs font-bold text-accent shrink-0">
            {user.username[0]?.toUpperCase()}
          </div>
          <span className="text-[13.5px] font-semibold text-ink-secondary">{user.username}</span>
        </div>
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
