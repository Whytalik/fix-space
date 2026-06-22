"use client";

import { GripVertical, Image as ImageIcon, X, Trash2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import type { SelectOption, SelectCategory } from "@fixspace/domain";
import { STATUS_OPTION_COLOR_VALUES } from "@fixspace/domain";

interface SelectOptionItemProps {
  option: SelectOption;
  onUpdate: (value: string) => void;
  onRemove: () => void;
  onUpdateColor: (color: string) => void;
  onOpenIconPicker: (element: HTMLElement) => void;
}

export function SelectOptionItem({ option, onUpdate, onRemove, onUpdateColor, onOpenIconPicker }: SelectOptionItemProps) {
  const t = useTranslations("PropertyConfig");
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: option.value });
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
      {option.color && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />}
      <button
        type="button"
        onClick={(e) => onOpenIconPicker(e.currentTarget)}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0 transition-colors duration-150"
      >
        {option.icon ? <IconDisplay value={option.icon} size={12} /> : <ImageIcon size={11} className="text-ink-muted" />}
      </button>
      <input
        type="text"
        value={option.value}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={t("optionPlaceholder")}
        className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-ink-muted"
      />
      <div className="flex items-center gap-0.5">
        {STATUS_OPTION_COLOR_VALUES.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onUpdateColor(color)}
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

interface CategoryItemProps {
  category: SelectCategory;
  categoryIndex: number;
  onUpdateLabel: (label: string) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onRemoveOption: (optionIndex: number) => void;
  onUpdateOptionColor: (optionIndex: number, color: string) => void;
  onOpenIconPicker: (element: HTMLElement, optionIndex: number) => void;
}

export function CategoryItem({
  category,
  onUpdateLabel,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onUpdateOptionColor,
  onOpenIconPicker,
}: CategoryItemProps) {
  const t = useTranslations("PropertyConfig");
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: category.label });
  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-stroke overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-surface">
        <button type="button" className="cursor-grab text-ink-muted shrink-0" {...listeners}>
          <GripVertical size={14} />
        </button>
        <TextInput size="sm" value={category.label} onChange={onUpdateLabel} placeholder={t("categoryLabelPlaceholder")} />
        <button type="button" onClick={onRemove} className="text-ink-muted hover:text-error shrink-0 transition-colors duration-150">
          <Trash2 size={12} />
        </button>
      </div>
      <SortableContext items={category.options.map((opt) => opt.value)} strategy={verticalListSortingStrategy}>
        {(category.options as SelectOption[]).map((option, optionIndex) => (
          <SelectOptionItem
            key={optionIndex}
            option={option}
            onUpdate={(value) => onUpdateOption(optionIndex, value)}
            onRemove={() => onRemoveOption(optionIndex)}
            onUpdateColor={(color) => onUpdateOptionColor(optionIndex, color)}
            onOpenIconPicker={(element) => onOpenIconPicker(element, optionIndex)}
          />
        ))}
      </SortableContext>
      <button
        type="button"
        onClick={onAddOption}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 border-t border-stroke text-xs text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors duration-150"
      >
        <Plus size={11} /> {t("addOption")}
      </button>
    </div>
  );
}
