"use client";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  size?: "md" | "sm";
};

export function TextInput({
  value,
  onChange,
  placeholder,
  multiline,
  rows = 3,
  disabled,
  size = "md",
}: TextInputProps) {
  const cls = size === "sm" ? "field-input w-full !py-1 !text-xs" : "field-input w-full";

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`${cls} resize-none`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cls}
    />
  );
}
