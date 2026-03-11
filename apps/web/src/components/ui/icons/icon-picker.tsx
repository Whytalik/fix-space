"use client";

import { useEscape } from "@/hooks/useEscape";
import { getPopoverStyle } from "@/utils/popover";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getAllIcons } from "./icon-display";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export function IconPicker({ value, onChange, onClose, anchorEl }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredIcons = useMemo(() => {
    const all = getAllIcons();
    const q = search.toLowerCase().trim();
    if (!q) return all;
    return all.filter(({ displayName }) => displayName.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (containerRef.current.contains(target)) return;
      if (anchorEl && anchorEl.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorEl]);

  useEscape(onClose);

  const portalStyle = anchorEl ? getPopoverStyle(anchorEl) : undefined;

  const content = (
    <div
      ref={containerRef}
      style={portalStyle}
      className="flex flex-col rounded-xl border border-stroke bg-elevated shadow-lg overflow-hidden w-72"
    >
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
            <button onClick={() => setSearch("")} className="shrink-0 text-ink-muted hover:text-ink transition-colors">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="scrollbar overflow-y-auto px-2 pb-2.5" style={{ maxHeight: "180px" }}>
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
                    isSelected ? "bg-accent text-white" : "text-ink-secondary hover:bg-surface hover:text-ink"
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

  if (anchorEl) {
    return createPortal(content, document.body);
  }
  return content;
}
