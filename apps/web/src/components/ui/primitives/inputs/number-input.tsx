"use client";

type NumberInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "md" | "sm";
};

export function NumberInput({ value, onChange, placeholder = "0", min, max, step, disabled, size = "md" }: NumberInputProps) {
  const className =
    size === "sm"
      ? "field-input w-full !py-1 !text-xs font-mono tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
      : "field-input w-full font-mono tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden";

  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={className}
    />
  );
}
