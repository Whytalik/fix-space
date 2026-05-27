"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "md" | "sm" | "icon";
  loading?: boolean;
  active?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, active = false, children, disabled, className = "", ...rest },
  ref,
) {
  const isDisabled = disabled || loading;

  const base =
    size === "icon"
      ? "inline-flex items-center justify-center p-1.5 rounded-lg transition-all duration-150"
      : `inline-flex items-center justify-center gap-1.5 ${size === "sm" ? "px-3 py-1.5 text-xs font-medium" : "px-4 py-[7px] text-sm font-semibold"} rounded-lg transition-all duration-150`;
  const state = isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer";
  const variantCls =
    variant === "primary"
      ? "bg-accent text-white border-0 hover:bg-accent-hover"
      : variant === "danger"
        ? "bg-error text-white border-0 hover:bg-error/85"
        : variant === "ghost"
          ? active
            ? "bg-surface border-0 text-ink"
            : "bg-transparent border-0 text-ink-secondary hover:bg-surface hover:text-ink"
          : "bg-surface border border-stroke text-ink-secondary hover:text-ink hover:border-ink-muted";

  return (
    <button ref={ref} {...rest} disabled={isDisabled} className={`${base} ${state} ${variantCls} ${className}`}>
      {children}
    </button>
  );
});
