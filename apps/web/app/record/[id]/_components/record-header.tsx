"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Button } from "@/components/ui/primitives/button";
import { Toggle } from "@/components/ui/primitives/toggle";
import type { RecordResponseDto } from "@nucleus/domain";
import { Eye, Notebook, PanelRight, Pencil, Trash2 } from "lucide-react";
import type React from "react";

type RecordHeaderProps = {
  isEditMode: boolean;
  isSaving: boolean;
  nameValue: string;
  iconValue: string;
  showIconPicker: boolean;
  iconButtonRef: React.RefObject<HTMLButtonElement | null>;
  onToggleMode: () => void;
  onOpenDelete: () => void;
  onNameChange: (v: string) => void;
  onIconChange: (v: string) => void;
  onIconPickerToggle: () => void;
  onIconPickerClose: () => void;
  record: RecordResponseDto;
  propsOpen: boolean;
  onPropsToggle: () => void;
  onEditContent: () => void;
};

export function RecordHeader({
  isEditMode,
  isSaving,
  nameValue,
  iconValue,
  showIconPicker,
  iconButtonRef,
  onToggleMode,
  onOpenDelete,
  onNameChange,
  onIconChange,
  onIconPickerToggle,
  onIconPickerClose,
  record,
  propsOpen,
  onPropsToggle,
  onEditContent,
}: RecordHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {isEditMode ? (
          <>
            <button
              ref={iconButtonRef}
              type="button"
              onClick={onIconPickerToggle}
              className="text-[1.125rem] leading-none shrink-0 hover:opacity-70 transition-opacity duration-150 cursor-pointer"
              title="Change icon"
            >
              {iconValue ? <IconDisplay value={iconValue} size={22} /> : <Notebook size={22} />}
            </button>
            {showIconPicker && (
              <IconPicker
                value={iconValue}
                onChange={(val) => {
                  onIconChange(val);
                  onIconPickerClose();
                }}
                onClose={onIconPickerClose}
                anchorEl={iconButtonRef.current}
              />
            )}
            <input
              type="text"
              className="flex-1 min-w-0 bg-transparent text-[1.25rem] font-bold leading-[1.1] tracking-tight text-ink border-b border-stroke focus:border-accent outline-none transition-colors duration-150 pb-1"
              value={nameValue}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Untitled"
            />
          </>
        ) : (
          <>
            <span className="text-[1.125rem] leading-none shrink-0 select-none">
              {record.icon ? <IconDisplay value={record.icon} size={22} /> : <Notebook size={22} />}
            </span>
            <h1 className="text-[1.25rem] font-bold leading-[1.1] tracking-tight text-ink wrap-break-word">
              {record.name || "Untitled"}
            </h1>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button size="sm" variant="secondary" onClick={onEditContent} title="Open content editor">
          <PanelRight size={14} />
          Edit Content
        </Button>

        <div className="w-px h-5 bg-stroke" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink-muted">Properties</span>
          <Toggle value={propsOpen} onChange={onPropsToggle} />
        </div>

        <div className="w-px h-5 bg-stroke" />

        <Button
          size="icon"
          variant="secondary"
          onClick={onToggleMode}
          disabled={isSaving}
          title={isSaving ? "Saving…" : isEditMode ? "View mode" : "Edit mode"}
          className="p-2.5!"
        >
          {isSaving ? (
            <span className="w-4 h-4 rounded-full border-2 border-stroke border-t-accent animate-spin" />
          ) : isEditMode ? (
            <Eye size={16} />
          ) : (
            <Pencil size={16} />
          )}
        </Button>
        <Button size="icon" variant="danger" onClick={onOpenDelete} title="Delete record" className="p-2.5!">
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
