"use client";

type DateInputProps = {
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
  disabled?: boolean;
  size?: "md" | "sm";
};

export function DateInput({ value, onChange, includeTime, disabled, size = "md" }: DateInputProps) {
  const cls = size === "sm" ? "field-input w-full !py-1 !text-xs" : "field-input w-full";

  return (
    <input
      type={includeTime ? "datetime-local" : "date"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cls}
    />
  );
}
