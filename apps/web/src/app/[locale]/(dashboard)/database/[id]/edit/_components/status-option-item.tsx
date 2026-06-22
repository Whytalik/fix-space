"use client";

import { GripVertical, Image as ImageIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import type { StatusCategoryConfig, StatusOptionColor } from "@fixspace/domain";
import { STATUS_OPTION_COLOR_VALUES } from "@fixspace/domain";

interface StatusOptionItemProps {
  option: StatusCategoryConfig["options"][number];
  onUpdateName: (name: string) => void;
  onRemove: () => void;
  onUpdateColor: (color: StatusOptionColor) => void;
  onOpenIconPicker: (element: HTMLElement) => void;
}

export function StatusOptionItem({ option, onUpdateName, onRemove, onUpdateColor, onOpenIconPicker }: StatusOptionItemProps) {
  const t = useTranslations("PropertyConfig");
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: option.name });
  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 px-3 py-1.5 border-t border-stroke bg-elevated">
      <button type="button" className="cursor-grab text-ink-muted shrink-0" {...listeners}>
        <GripVertical size={14} />
      </button>
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
      <button
        type="button"
        onClick={(e) => onOpenIconPicker(e.currentTarget)}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0 transition-colors duration-150"
      >
        {option.icon ? <IconDisplay value={option.icon} size={12} /> : <ImageIcon size={11} className="text-ink-muted" />}
      </button>
      <input
        type="text"
        value={option.name}
        onChange={(e) => onUpdateName(e.target.value)}
        placeholder={t("optionPlaceholder")}
        className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-ink-muted"
      />
      <div className="flex items-center gap-0.5">
        {STATUS_OPTION_COLOR_VALUES.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onUpdateColor(color as StatusOptionColor)}
            className={`w-3 h-3 rounded-full transition-transform hover:scale-110 ${option.color === color ? "ring-1 ring-offset-1 ring-ink scale-110" : ""}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <button type="button" onClick={onRemove} className="text-ink-muted hover:text-error shrink-0 transition-colors duration-150">
        <X size={11} />
      </button>
    </div>
  );
}
