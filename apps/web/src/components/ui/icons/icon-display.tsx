"use client";

import { icons, type LucideIcon } from "lucide-react";

function toDisplayName(name: string): string {
  return name
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

type IconEntry = { name: string; displayName: string; icon: LucideIcon };
let _cache: IconEntry[] | null = null;

export function getAllIcons(): IconEntry[] {
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

interface IconDisplayProps {
  value: string;
  size?: number;
}

export function IconDisplay({ value, size = 16 }: IconDisplayProps) {
  if (!value) return null;
  if (value.startsWith("icon:")) {
    const name = value.slice(5);
    const entry = getAllIcons().find((i) => i.name === name);
    if (!entry) return null;
    const Icon = entry.icon;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <Icon size={size} />
      </span>
    );
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
