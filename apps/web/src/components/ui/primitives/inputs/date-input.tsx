"use client";

type DateInputProps = {
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
  disabled?: boolean;
  size?: "md" | "sm";
  min?: string;
  max?: string;
};

export function DateInput({ value, onChange, includeTime, disabled, size = "md", min, max }: DateInputProps) {
  const className = size === "sm" ? "field-input w-full !py-1 !text-xs" : "field-input w-full";

  return (
    <input
      type={includeTime ? "datetime-local" : "date"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      min={min}
      max={max}
      className={className}
    />
  );
}
