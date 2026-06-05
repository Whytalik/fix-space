"use client";

import { CUSTOM_TRADING_ICONS } from "./trading-icons";
import { icons, type LucideIcon } from "lucide-react";

function toDisplayName(name: string): string {
  return name
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

type IconEntry = { name: string; displayName: string; icon: LucideIcon };
let iconCache: IconEntry[] | null = null;

export function getAllIcons(): IconEntry[] {
  if (iconCache) return iconCache;
  iconCache = Object.entries(icons)
    .map(([name, icon]) => ({
      name,
      displayName: toDisplayName(name),
      icon,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
  return iconCache;
}

interface IconDisplayProps {
  value: string;
  size?: number;
}

const iconStyle = (size: number) =>
  ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    flexShrink: 0,
  }) as const;

export function IconDisplay({ value, size = 16 }: IconDisplayProps) {
  if (!value) return null;

  if (value.startsWith("trading:")) {
    const Icon = CUSTOM_TRADING_ICONS[value.slice(8)];
    if (!Icon) return null;
    return (
      <span style={iconStyle(size)}>
        <Icon size={size} />
      </span>
    );
  }

  if (value.startsWith("icon:")) {
    const Icon = getAllIcons().find((entry) => entry.name === value.slice(5))?.icon;
    if (!Icon) return null;
    return (
      <span style={iconStyle(size)}>
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
