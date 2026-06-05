"use client";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ElementType;
}

type TabSwitcherProps<T extends string = string> = {
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  orientation?: "horizontal" | "vertical";
};

export function TabSwitcher<T extends string = string>({ items, active, onChange, orientation = "horizontal" }: TabSwitcherProps<T>) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`${isVertical ? "flex flex-col gap-0.5 p-1 rounded-xl border border-stroke bg-surface" : "inline-flex items-center gap-0.5 rounded-xl bg-surface p-1 border border-stroke"}`}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              isVertical ? "px-3 py-2 w-full" : "px-4 py-1.5"
            } ${isActive ? "bg-elevated text-ink shadow-sm" : "text-ink-muted hover:text-ink-secondary"}`}
          >
            {Icon && <Icon size={14} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
