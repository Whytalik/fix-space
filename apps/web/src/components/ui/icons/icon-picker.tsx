"use client";

import { useFloatingPanel } from "@/hooks/useFloatingPanel";
import { getPopoverStyle } from "@/utils/popover";
import { CUSTOM_TRADING_ICONS, TRADING_LUCIDE_NAMES } from "./trading-icons";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getAllIcons } from "./icon-display";
import type { LucideIcon } from "lucide-react";

type Tab = "all" | "trading";

interface IconEntry {
  name: string;
  displayName: string;
  icon: LucideIcon;
  prefix: "icon" | "trading";
}

function getTradingIcons(): IconEntry[] {
  const allIcons = getAllIcons();
  const lucideEntries = TRADING_LUCIDE_NAMES.flatMap((name) => {
    const entry = allIcons.find((found) => found.name === name);
    return entry ? [{ ...entry, prefix: "icon" as const }] : [];
  });
  const customEntries = Object.entries(CUSTOM_TRADING_ICONS).map(([name, icon]) => ({
    name,
    displayName: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
    icon,
    prefix: "trading" as const,
  }));
  return [...lucideEntries, ...customEntries];
}

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export function IconPicker({ value, onChange, onClose, anchorEl }: IconPickerProps) {
  const t = useTranslations("IconPicker");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allIcons = useMemo(() => getAllIcons().map((entry) => ({ ...entry, prefix: "icon" as const })), []);
  const tradingIcons = useMemo(getTradingIcons, []);

  const filteredIcons = useMemo(() => {
    const source = tab === "trading" ? tradingIcons : allIcons;
    const query = search.toLowerCase().trim();
    if (!query) return source;
    return source.filter(({ displayName }) => displayName.toLowerCase().includes(query));
  }, [tab, search, allIcons, tradingIcons]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useFloatingPanel(containerRef, onClose, anchorEl);

  const portalStyle = anchorEl ? getPopoverStyle(anchorEl) : undefined;

  const content = (
    <div
      ref={containerRef}
      style={portalStyle}
      className="flex flex-col rounded-2xl border border-stroke bg-elevated shadow-lg overflow-hidden w-72"
    >
      <div className="shrink-0 px-2.5 pt-2.5 pb-1">
        <div className="flex items-center gap-2 rounded-lg bg-surface border border-stroke px-2.5 py-1.5 focus-within:border-accent transition-colors duration-150">
          <Search size={12} className="text-ink-muted shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchIcons")}
            className="flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted min-w-0"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 text-ink-muted hover:text-ink transition-colors duration-150"
            >
              <X size={11} />
            </button>
          )}
        </div>

        <div className="flex gap-1 mt-2">
          {(["all", "trading"] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTab(tabKey)}
              className={`flex-1 py-1 text-xs rounded-lg transition-colors duration-150 ${
                tab === tabKey ? "bg-accent text-white" : "text-ink-secondary hover:bg-surface hover:text-ink"
              }`}
            >
              {tabKey === "all" ? t("tabAll") : t("tabTrading")}
            </button>
          ))}
        </div>
      </div>

      <div className="scrollbar overflow-y-auto max-h-45 px-2 pb-2.5">
        {filteredIcons.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-muted">{t("noIconsFound")}</p>
        ) : (
          <div className="grid grid-cols-7 gap-0.5">
            {filteredIcons.map(({ name, displayName, icon: Icon, prefix }) => {
              const key = `${prefix}:${name}`;
              const isSelected = value === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={displayName}
                  onClick={() => onChange(key)}
                  className={`flex items-center justify-center rounded-lg aspect-square transition-colors duration-150 ${
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

  if (anchorEl) return createPortal(content, document.body);
  return content;
}
