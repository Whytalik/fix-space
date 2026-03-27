"use client";

import { Check } from "lucide-react";

type CheckboxInputProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export function CheckboxInput({ checked, onChange, label }: CheckboxInputProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors duration-150 ${
          checked ? "bg-accent border-accent" : "border-stroke bg-transparent"
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </button>
  );
}
