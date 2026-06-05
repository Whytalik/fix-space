"use client";

interface DatePropertyInputProps {
  value: unknown;
  onChange: (val: string) => void;
}

export function DatePropertyInput({ value, onChange }: DatePropertyInputProps) {
  return <input type="date" className="field-input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
}
