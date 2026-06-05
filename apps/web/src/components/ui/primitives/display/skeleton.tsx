"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-md bg-[length:200%_100%] animate-shimmer ${className}`}
      style={{
        background: "linear-gradient(90deg, var(--color-stroke) 25%, var(--color-elevated) 50%, var(--color-stroke) 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}
