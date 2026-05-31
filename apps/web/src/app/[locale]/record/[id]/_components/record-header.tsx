"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/primitives/actions/button";
import type { RecordResponseDto } from "@fixspace/domain";
import { Eye, Notebook, Pencil, Trash2 } from "lucide-react";
import type React from "react";
import { useTranslations } from "next-intl";

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
}: RecordHeaderProps) {
  const t = useTranslations("RecordPage");
  const th = useTranslations("RecordHeaderComp");
  return (
    <div className="flex flex-col gap-1 mb-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isEditMode ? (
            <>
              <button
                ref={iconButtonRef}
                type="button"
                onClick={onIconPickerToggle}
                className="text-[1.125rem] leading-none shrink-0 hover:opacity-70 transition-opacity duration-150 cursor-pointer"
                title={t("changeIcon")}
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
                placeholder={t("untitled")}
              />
            </>
          ) : (
            <>
              <span className="text-[1.125rem] leading-none shrink-0 select-none">
                {record.icon ? <IconDisplay value={record.icon} size={22} /> : <Notebook size={22} />}
              </span>
              <h1 className="text-[1.25rem] font-bold leading-[1.1] tracking-tight text-ink wrap-break-word">
                {record.name || t("untitled")}
              </h1>
            </>
          )}
        </div>

        <div className="flex gap-1.5 shrink-0">
          {!isEditMode && (
            <Button
              size="icon"
              variant={propsOpen ? "primary" : "secondary"}
              onClick={onPropsToggle}
              title={propsOpen ? th("hideProperties") : th("showProperties")}
              className="p-2.5!"
            >
              {propsOpen ? <Eye size={16} /> : <Eye size={16} className="opacity-50" />}
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            onClick={onToggleMode}
            disabled={isSaving}
            title={isSaving ? th("saving") : isEditMode ? th("viewMode") : th("editMode")}
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
          <Button size="icon" variant="danger" onClick={onOpenDelete} title={th("deleteRecord")} className="p-2.5!">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
