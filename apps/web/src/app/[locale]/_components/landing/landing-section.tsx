import type { ReactNode } from "react";

interface LandingSectionProps {
  id?: string;
  variant?: "canvas" | "surface";
  children: ReactNode;
  className?: string;
  noBorder?: boolean;
}

export function LandingSection({
  id,
  variant = "canvas",
  children,
  className = "",
  noBorder = false,
}: LandingSectionProps) {
  const bgClass = variant === "surface" ? "bg-surface/30" : "bg-canvas";
  const borderClass = !noBorder && variant === "surface" ? "border-y border-stroke" : "";

  return (
    <section
      id={id}
      className={`min-h-[800px] flex items-center py-24 px-6 scroll-mt-15 ${bgClass} ${borderClass} ${className}`}
    >
      <div className="max-w-270 mx-auto w-full flex flex-col justify-center">{children}</div>
    </section>
  );
}
