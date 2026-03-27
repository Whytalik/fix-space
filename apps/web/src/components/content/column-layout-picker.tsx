"use client";

type ColumnLayoutPickerProps = {
  current: number;
  onChange: (columns: number) => void;
};

const COLUMN_OPTIONS = [
  {
    columns: 1,
    label: "1 column",
    icon: (
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    columns: 2,
    label: "2 columns",
    icon: (
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="1" width="7" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    columns: 3,
    label: "3 columns",
    icon: (
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="4" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="7" y="1" width="4" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="1" width="4" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export function ColumnLayoutPicker({ current, onChange }: ColumnLayoutPickerProps) {
  return (
    <div className="flex items-center gap-0.5 bg-elevated border border-stroke rounded-lg px-1 py-0.5 shadow-md">
      {COLUMN_OPTIONS.map(({ columns, label, icon }) => (
        <button
          key={columns}
          type="button"
          title={label}
          onClick={() => onChange(columns)}
          className={`p-1 rounded transition-colors duration-150 ${
            current === columns
              ? "text-accent bg-accent-muted"
              : "text-ink-muted hover:text-ink hover:bg-surface"
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
