"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RecordSortDto } from "@fixspace/domain";
import { SortDirection, SortField } from "@fixspace/domain";

import { PropertyHint } from "../properties/ui/property-hint";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";

type SortItem = RecordSortDto & { id: string };

function optionValue(sort: RecordSortDto): string {
  return sort.field === SortField.PROPERTY ? `prop:${sort.propertyId}` : `meta:${sort.field}`;
}

interface SortRowProps {
  item: SortItem;
  rowOptions: ComboboxOption[];
  prop: { id: string; name: string; type: string; hint?: string | null } | null | undefined;
  onApplyOption: (value: string) => void;
  onToggleDirection: () => void;
  onRemove: () => void;
}

export function SortRow({ item, rowOptions, prop, onApplyOption, onToggleDirection, onRemove }: SortRowProps) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: item.id });
  const t = useTranslations("SortPanel");
  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString({ ...transform, x: 0 }) : undefined,
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 p-1.5 rounded-lg border border-stroke bg-canvas-subtle/50 hover:bg-canvas-subtle hover:border-stroke-strong transition-colors duration-150"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          className="cursor-grab text-ink-muted hover:text-ink transition-colors duration-150 shrink-0 px-1"
          {...listeners}
        >
          <GripVertical size={14} />
        </button>

        <div className="flex items-center gap-2 w-44 shrink-0">
          <div className="flex-1 min-w-0">
            <Combobox options={rowOptions} value={optionValue(item)} size="sm" onChange={onApplyOption} />
          </div>
          {prop?.hint && <PropertyHint hint={prop.hint} />}
        </div>

        <button
          type="button"
          onClick={onToggleDirection}
          title={item.direction === SortDirection.ASC ? t("ascending") : t("descending")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stroke bg-surface text-xs font-medium text-ink-secondary hover:border-ink-muted hover:text-ink transition-colors duration-150 shadow-sm"
        >
          {item.direction === SortDirection.ASC ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          <span className="min-w-[32px] text-left">{item.direction === SortDirection.ASC ? t("asc") : t("desc")}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-lg text-ink-muted hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
