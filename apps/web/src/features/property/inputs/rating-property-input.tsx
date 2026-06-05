"use client";

type RatingPropertyInputProps = {
  value: number | null;
  onChange: (value: number) => void;
  maxStars?: number;
  className?: string;
};

export function RatingPropertyInput({ value, onChange, maxStars = 5, className = "" }: RatingPropertyInputProps) {
  return (
    <input
      type="range"
      min={1}
      max={maxStars}
      step={1}
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${className}`}
      style={{
        background: `linear-gradient(to right, var(--color-accent) ${((value ?? 0) / maxStars) * 100}%, var(--color-stroke) ${((value ?? 0) / maxStars) * 100}%)`,
      }}
    />
  );
}
