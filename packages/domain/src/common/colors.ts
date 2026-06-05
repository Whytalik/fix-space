export const PALETTE_COLORS = {
  gray: "#6B7280",
  brown: "#92400E",
  amber: "#D97706",
  gold: "#CA8A04",
  green: "#16A34A",
  blue: "#2563EB",
  purple: "#7C3AED",
  pink: "#DB2777",
  red: "#DC2626",
} as const;

export type PaletteColorName = keyof typeof PALETTE_COLORS;
export const PALETTE_COLOR_VALUES = Object.values(PALETTE_COLORS) as string[];
