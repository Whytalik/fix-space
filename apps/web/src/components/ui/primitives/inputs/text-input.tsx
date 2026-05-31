"use client";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  size?: "md" | "sm";
  error?: string;
  hint?: string;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  multiline,
  rows = 3,
  disabled,
  size = "md",
  error,
  hint,
}: TextInputProps) {
  const base = size === "sm" ? "field-input !py-1 !text-xs" : "field-input";
  const cls = `${base}${error ? " !border-error" : ""}`;

  const input = multiline ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`${cls} resize-none`}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cls}
    />
  );

  if (!error && !hint) return input;

  return (
    <div className="flex flex-col gap-1">
      {input}
      {error && <p className="text-xs text-error">{error}</p>}
      {!error && hint && <p className="type-hint">{hint}</p>}
    </div>
  );
}
