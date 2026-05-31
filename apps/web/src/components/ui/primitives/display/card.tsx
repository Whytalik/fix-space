import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "flat" | "elevated";
}

export function Card({ children, className = "", style, variant = "flat" }: CardProps) {
  const variantCls = variant === "elevated" ? "card-elevated" : "card";
  return (
    <div className={`${variantCls} p-5 ${className}`} style={style}>
      {children}
    </div>
  );
}
