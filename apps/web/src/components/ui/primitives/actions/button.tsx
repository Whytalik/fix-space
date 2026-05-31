"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm" | "icon";
  loading?: boolean;
  active?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, active = false, children, disabled, className = "", ...rest },
  ref,
) {
  const isDisabled = disabled || loading;

  const focus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas";
  const base =
    size === "icon"
      ? `inline-flex items-center justify-center p-1.5 rounded-lg transition-colors duration-150 ${focus}`
      : `inline-flex items-center justify-center gap-1.5 ${size === "sm" ? "px-3 py-1.5 text-xs font-medium" : "px-4 py-[7px] text-sm font-semibold"} rounded-lg transition-colors duration-150 ${focus}`;
  const state = isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer";
  const variantCls =
    variant === "primary"
      ? "bg-accent text-white border-0 hover:bg-accent-hover"
      : variant === "danger"
        ? "bg-error text-white border-0 hover:bg-error/85"
        : variant === "ghost"
          ? `bg-transparent border-0 text-ink-secondary hover:bg-surface hover:text-ink${active ? " bg-surface text-ink" : ""}`
          : "bg-surface border border-stroke text-ink-secondary hover:text-ink hover:border-ink-muted";

  const spinnerColor = variant === "primary" || variant === "danger" ? "white" : "default";

  return (
    <button ref={ref} {...rest} disabled={isDisabled} className={`${base} ${state} ${variantCls} ${className}`}>
      {loading ? <Spinner size="sm" color={spinnerColor} /> : children}
    </button>
  );
});
