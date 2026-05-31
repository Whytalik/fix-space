"use client";

interface ProgressBarProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: "md" | "sm";
  className?: string;
}

export function ProgressBar({ value, showLabel = false, size = "md", className = "" }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, value));
  const height = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className={`flex items-center gap-2 w-full ${className}`}>
      <div className={`flex-1 bg-stroke rounded-full overflow-hidden ${height}`}>
        <div
          className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-medium text-ink-secondary tabular-nums min-w-[32px] text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
