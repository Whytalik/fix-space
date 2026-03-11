import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "flat" | "convex";
}

const variantClass = {
  flat: "bg-surface shadow-md",
  convex: "bg-[#202022] shadow-md",
};

export function Card({ children, className = "", style, variant = "flat" }: CardProps) {
  return (
    <div
      className={`border border-stroke rounded-xl p-5 ${variantClass[variant]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
