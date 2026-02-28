import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={`bg-surface border border-stroke rounded-xl p-7 shadow-md ${className}`}>{children}</div>;
}
