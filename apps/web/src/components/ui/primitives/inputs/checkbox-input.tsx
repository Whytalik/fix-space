"use client";

import { Check } from "lucide-react";

type CheckboxInputProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function CheckboxInput({ checked, onChange, label, disabled }: CheckboxInputProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center gap-2 select-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors duration-150 ${
          checked ? (disabled ? "bg-accent/50 border-accent/50" : "bg-accent border-accent") : "border-stroke bg-transparent"
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </button>
  );
}
