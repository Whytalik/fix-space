"use client";

export type EditTab = "general" | "properties" | "templates";

const TABS: { id: EditTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "properties", label: "Properties" },
  { id: "templates", label: "Templates" },
];

type EditTabSwitcherProps = {
  active: EditTab;
  onChange: (tab: EditTab) => void;
};

export function EditTabSwitcher({ active, onChange }: EditTabSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl bg-surface p-1 border border-stroke">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            active === tab.id ? "bg-elevated text-ink shadow-sm" : "text-ink-muted hover:text-ink-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
