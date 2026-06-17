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
  type?: string;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
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
  type = "text",
  onBlur,
  onKeyDown,
  autoFocus,
}: TextInputProps) {
  const base = size === "sm" ? "field-input !py-1 !text-xs" : "field-input";
  const className = `${base}${error ? " !border-error" : ""}`;

  const input = multiline ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`${className} resize-none`}
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      className={className}
    />
  );

  if (!error && !hint) return input;

  return (
    <div className="flex flex-col gap-1">
      {hint && !error && <p className="type-hint">{hint}</p>}
      {input}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
