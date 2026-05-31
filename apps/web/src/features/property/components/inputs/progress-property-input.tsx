"use client";

type ProgressPropertyInputProps = {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showLabel?: boolean;
  className?: string;
};

export function ProgressPropertyInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showLabel = true,
  className = "",
}: ProgressPropertyInputProps) {
  const percentage = max > 0 ? (((value ?? min) - min) / (max - min)) * 100 : 0;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-accent) ${percentage}%, var(--color-stroke) ${percentage}%)`,
        }}
      />
      {showLabel && <span className="text-sm text-ink-muted text-right">{value ?? min}%</span>}
    </div>
  );
}
