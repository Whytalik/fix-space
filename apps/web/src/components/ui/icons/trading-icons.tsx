"use client";

import type { LucideIcon } from "lucide-react";

export const TRADING_LUCIDE_NAMES = [
  "ChartCandlestick",
  "ChartLine",
  "ChartArea",
  "ChartBar",
  "ChartSpline",
  "TrendingUp",
  "TrendingDown",
  "TrendingUpDown",
  "Activity",
  "Target",
  "Gauge",
  "Scale",
  "Percent",
  "ArrowUp",
  "ArrowDown",
  "ArrowUpRight",
  "ArrowDownRight",
  "DollarSign",
  "Coins",
  "Banknote",
  "Wallet",
  "WalletCards",
  "CircleDollarSign",
  "BadgeDollarSign",
  "Bitcoin",
  "Landmark",
  "Briefcase",
  "PiggyBank",
  "Gem",
  "Receipt",
] as const;

interface CustomIconProps {
  size?: number;
  className?: string;
}

function InsideBarIcon({ size = 24, className }: CustomIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="7" y1="3" x2="7" y2="6" />
      <rect x="4.5" y="6" width="5" height="12" rx="0.5" />
      <line x1="7" y1="18" x2="7" y2="21" />
      <line x1="17" y1="7" x2="17" y2="9" />
      <rect x="14.5" y="9" width="5" height="7" rx="0.5" />
      <line x1="17" y1="16" x2="17" y2="18" />
    </svg>
  );
}

export const CUSTOM_TRADING_ICONS: Record<string, LucideIcon> = {
  InsideBar: InsideBarIcon as unknown as LucideIcon,
};

export type CustomTradingIconName = keyof typeof CUSTOM_TRADING_ICONS;
