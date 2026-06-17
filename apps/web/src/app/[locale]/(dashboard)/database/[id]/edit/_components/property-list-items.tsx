"use client";

import { PropertyIcon } from "../../_components/properties/ui/property-icon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DatabaseResponseDto } from "@fixspace/domain";
import { Check, ChevronDown, ChevronRight, Eye, GripVertical, Link2, Pencil, Settings, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { GroupItem, PropItem } from "./property-list.utils";
import { getConfigSummary } from "./property-list.utils";
import { PropertyHint } from "../../_components/properties/ui/property-hint";

export type GroupHeaderProps = {
  item: GroupItem;
  displayName?: string;
  count: number;
  isCollapsed: boolean;
  isEditing: boolean;
  editValue: string;
  isLocked?: boolean;
  hasVisibilityCondition?: boolean;
  onToggleCollapse: () => void;
  onEditStart: () => void;
  onEditChange: (value: string) => void;
  onEditConfirm: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onSettings?: () => void;
};

export function GroupHeader({
  item,
  displayName,
  count,
  isCollapsed,
  isEditing,
  editValue,
  isLocked,
  hasVisibilityCondition,
  onToggleCollapse,
  onEditStart,
  onEditChange,
  onEditConfirm,
  onEditCancel,
  onDelete,
  onSettings,
}: GroupHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isLocked,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`flex items-center gap-2 px-3 py-2.5 bg-surface border-t border-stroke first:border-t-0 select-none ${isDragging ? "opacity-0" : ""}`}
    >
      {!isLocked && (
        <button type="button" className="cursor-grab text-ink-muted shrink-0 hover:text-ink transition-colors duration-150" {...listeners}>
          <GripVertical size={14} />
        </button>
      )}

      <button type="button" onClick={onToggleCollapse} className="text-ink-muted shrink-0 hover:text-ink transition-colors duration-150">
        {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
      </button>

      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditConfirm();
              if (e.key === "Escape") onEditCancel();
            }}
            className="flex-1 text-xs font-semibold uppercase tracking-widest bg-transparent border-b border-accent outline-none text-ink"
          />
          <button
            type="button"
            onClick={onEditConfirm}
            className="text-accent hover:text-accent/70 shrink-0 transition-colors duration-150"
          >
            <Check size={14} />
          </button>
          <button type="button" onClick={onEditCancel} className="text-ink-muted hover:text-ink shrink-0 transition-colors duration-150">
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">{displayName ?? item.name}</span>
          {hasVisibilityCondition && <Eye size={12} className="text-accent shrink-0" />}
          <span className="text-xs text-ink-muted tabular-nums">{count}</span>
          {!isLocked && (
            <>
              {onSettings && (
                <button
                  type="button"
                  onClick={onSettings}
                  className="text-ink-muted hover:text-ink shrink-0 transition-colors duration-150"
                >
                  <Settings size={14} />
                </button>
              )}
              <button type="button" onClick={onEditStart} className="text-ink-muted hover:text-ink shrink-0 transition-colors duration-150">
                <Pencil size={14} />
              </button>
              <button type="button" onClick={onDelete} className="text-ink-muted hover:text-error shrink-0 transition-colors duration-150">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export type PropertyRowProps = {
  item: PropItem;
  databases?: DatabaseResponseDto[];
  isLocked?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function PropertyRow({ item, databases, isLocked, onEdit, onDelete }: PropertyRowProps) {
  const t = useTranslations("PropertyEdit");
  const isProtected = item.prop.isProtected || item.prop.name === "Name";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: isLocked || isProtected,
  });
  const { prop } = item;
  const summary = getConfigSummary(prop, databases);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`group flex items-center gap-2 px-3 py-2.5 border-t border-stroke first:border-t-0 transition-opacity duration-100 ${isDragging ? "opacity-0" : ""}`}
    >
      {!isLocked && !isProtected && (
        <button type="button" className="cursor-grab text-ink-muted shrink-0 hover:text-ink transition-colors duration-150" {...listeners}>
          <GripVertical size={14} />
        </button>
      )}
      {isProtected && <div className="w-[14px] shrink-0" />}

      <PropertyIcon type={prop.type} size={14} className="text-ink-muted shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-sm ${prop.isVisible === false ? "text-ink-muted" : "text-ink"}`}>{prop.name}</span>
          {prop.integrationKey && (
            <span title={t("automatedByIntegration")} className="flex items-center">
              <Link2 size={12} className="text-accent shrink-0" />
            </span>
          )}
          {prop.hint && <PropertyHint hint={prop.hint} />}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-ink-muted font-mono">{prop.type}</span>
          {summary && (
            <>
              <span className="text-xs text-ink-muted">·</span>
              <span className="text-xs text-ink-muted truncate">{summary}</span>
            </>
          )}
        </div>
      </div>

      {!isLocked && (
        <>
          <button type="button" onClick={onEdit} className="text-ink-muted hover:text-ink shrink-0 p-1 transition-colors duration-150">
            <Pencil size={15} />
          </button>
          {!prop.isProtected && prop.name !== "Name" && (
            <button
              type="button"
              onClick={onDelete}
              className="text-ink-muted hover:text-error shrink-0 p-1 transition-colors duration-150"
            >
              <Trash2 size={15} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
