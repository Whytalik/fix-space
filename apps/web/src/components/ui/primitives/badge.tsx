import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  variant?: "accent" | "neutral";
  className?: string;
}

export function Badge({ children, color, variant = "neutral", className = "" }: BadgeProps) {
  const presetCls = color ? "" : variant === "accent" ? "bg-accent/10 text-accent" : "bg-elevated text-ink-secondary";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${presetCls} ${className}`}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  );
}
