"use client";

import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { Button } from "@/components/ui/primitives/button";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { Database, FolderOpen, LayoutDashboard, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const CATEGORIES = [
  { id: "profile", label: "Profile", icon: User },
  { id: "space", label: "Space", icon: LayoutDashboard },
  { id: "database", label: "Database", icon: Database },
  { id: "section", label: "Section", icon: FolderOpen },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user, isLoading } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("profile");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEscape(onClose);

  if (isLoading || !user || !mounted) return null;

  const activeLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={onClose}
    >
      <div
        className="flex w-215 overflow-hidden rounded-2xl border border-stroke bg-elevated shadow-lg"
        style={{ height: "min(580px, calc(100vh - 80px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="flex w-52 shrink-0 flex-col border-r border-stroke bg-surface py-5">
          <p className="mb-3 px-4 type-nav-label">Settings</p>
          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                  activeCategory === id ? "bg-elevated text-ink" : "text-ink-secondary hover:bg-elevated hover:text-ink"
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
              <h1 className="type-panel-title tracking-[-0.03em]">{activeLabel}</h1>
              <p className="mt-0.5 text-sm text-ink-secondary">Manage your {activeLabel.toLowerCase()} settings</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {activeCategory === "profile" && <ProfileSettings compact />}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
