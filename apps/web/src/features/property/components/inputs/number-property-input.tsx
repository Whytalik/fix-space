"use client";

interface NumberPropertyInputProps {
  value: unknown;
  onChange: (val: number | "") => void;
  placeholder?: string;
}

export function NumberPropertyInput({ value, onChange, placeholder = "0" }: NumberPropertyInputProps) {
  return (
    <input
      type="number"
      className="field-input"
      value={value === "" || value === undefined || value === null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      placeholder={placeholder}
    />
  );
}
