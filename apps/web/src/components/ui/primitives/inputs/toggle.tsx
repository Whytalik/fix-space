"use client";

type ToggleProps = { value: boolean; onChange: (v: boolean) => void };

export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-150 shrink-0 ${value ? "bg-accent" : "bg-stroke"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-4" : ""}`}
      />
    </button>
  );
}
