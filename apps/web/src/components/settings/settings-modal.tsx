"use client";

import { useAppContext } from "@/context/app-context";
import { Database, FolderOpen, LayoutDashboard, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const CATEGORIES = [
  { id: "profile", label: "Profile", icon: User },
  { id: "space", label: "Space", icon: LayoutDashboard },
  { id: "database", label: "Database", icon: Database },
  { id: "section", label: "Section", icon: FolderOpen },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export function SettingsModal() {
  const { user, isLoading } = useAppContext();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("profile");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  if (isLoading || !user || !mounted) return null;

  const activeLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={() => router.push("/")}
    >
      <div
        className="flex w-215 overflow-hidden rounded-2xl border border-stroke bg-elevated shadow-lg"
        style={{ height: "min(580px, calc(100vh - 80px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="flex w-52 shrink-0 flex-col border-r border-stroke bg-surface py-5">
          <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Settings
          </p>
          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                  activeCategory === id
                    ? "bg-elevated text-ink"
                    : "text-ink-secondary hover:bg-elevated hover:text-ink"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-stroke px-8 pb-4 pt-5">
            <div>
              <h1 className="text-lg font-bold tracking-[-0.03em] text-ink">{activeLabel}</h1>
              <p className="mt-0.5 text-sm text-ink-secondary">
                Manage your {activeLabel.toLowerCase()} settings
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
