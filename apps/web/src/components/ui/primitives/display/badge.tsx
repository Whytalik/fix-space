import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "error";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantCls: Record<BadgeVariant, string> = {
  neutral: "bg-elevated text-ink-secondary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
};

export function Badge({ children, color, variant = "neutral", className = "" }: BadgeProps) {
  const preset = color ? "" : variantCls[variant];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${preset} ${className}`}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  );
}

interface StatusDotProps {
  variant?: BadgeVariant;
  label: string;
  className?: string;
}

const dotCls: Record<BadgeVariant, string> = {
  neutral: "bg-ink-muted",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

const labelCls: Record<BadgeVariant, string> = {
  neutral: "text-ink-secondary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export function StatusDot({ variant = "neutral", label, className = "" }: StatusDotProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotCls[variant]}`} />
      <span className={`text-xs font-medium ${labelCls[variant]}`}>{label}</span>
    </span>
  );
}
