"use client";

import { icons, Search, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDisplayName(name: string): string {
  return name
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

type IconEntry = { name: string; displayName: string; icon: LucideIcon };
let _cache: IconEntry[] | null = null;

function getAllIcons(): IconEntry[] {
  if (_cache) return _cache;
  _cache = Object.entries(icons)
    .map(([name, icon]) => ({
      name,
      displayName: toDisplayName(name),
      icon,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return _cache;
}

export function IconDisplay({ value, size = 16 }: { value: string; size?: number }) {
  if (!value) return null;
  if (value.startsWith("icon:")) {
    const name = value.slice(5);
    const entry = getAllIcons().find((i) => i.name === name);
    if (!entry) return null;
    const Icon = entry.icon;
    return <Icon size={size} />;
  }
  return (
    <span
      style={{
        fontSize: Math.round(size * 0.85),
        width: size,
        height: size,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {value}
    </span>
  );
}

// ─── IconPicker ───────────────────────────────────────────────────────────────

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const filteredIcons = useMemo(() => {
    const all = getAllIcons();
    const q = search.toLowerCase().trim();
    if (!q) return all;
    return all.filter(({ displayName }) => displayName.toLowerCase().includes(q));
  }, [search]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col rounded-xl border border-stroke bg-elevated shadow-lg overflow-hidden w-72"
    >
      {/* Search */}
      <div className="shrink-0 px-2.5 pt-2.5 pb-2">
        <div className="flex items-center gap-2 rounded-lg bg-surface border border-stroke px-2.5 py-1.5 focus-within:border-accent transition-colors duration-150">
          <Search size={12} className="text-ink-muted shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons…"
            className="flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted min-w-0"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 text-ink-muted hover:text-ink transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Icons grid */}
      <div className="overflow-y-auto px-2 pb-2.5" style={{ maxHeight: "320px" }}>
        {filteredIcons.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-muted">No icons found</p>
        ) : (
          <div className="grid grid-cols-7 gap-0.5">
            {filteredIcons.map(({ name, displayName, icon: Icon }) => {
              const key = `icon:${name}`;
              const isSelected = value === key;
              return (
                <button
                  key={name}
                  title={displayName}
                  onClick={() => onChange(key)}
                  className={`flex items-center justify-center rounded-md aspect-square transition-colors duration-100 ${
                    isSelected
                      ? "bg-accent text-white"
                      : "text-ink-secondary hover:bg-surface hover:text-ink"
                  }`}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
