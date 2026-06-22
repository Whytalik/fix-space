"use client";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  color?: "default" | "white";
  className?: string;
  label?: string;
};

const SIZE_CLASSES = {
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-6 h-6 border-2",
};

const COLOR_CLASSES = {
  default: "border-stroke border-t-accent",
  white: "border-white/30 border-t-white",
};

export function Spinner({ size = "md", color = "default", className = "", label = "Loading" }: SpinnerProps) {
  return (
    <div
      className={`rounded-full animate-spin ${SIZE_CLASSES[size]} ${COLOR_CLASSES[color]} ${className}`}
      role="status"
      aria-label={label}
    />
  );
}
