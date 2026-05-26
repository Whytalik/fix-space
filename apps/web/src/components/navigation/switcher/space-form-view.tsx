"use client";

import { Button } from "@/components/ui/primitives/button";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { ArrowLeft, Smile } from "lucide-react";
import { useTranslations } from "next-intl";
import { type RefObject } from "react";

interface SpaceFormViewProps {
  title: string;
  name: string;
  icon: string;
  showIconPicker: boolean;
  iconButtonRef: RefObject<HTMLButtonElement | null>;
  isLoading: boolean;
  error?: string | null;
  submitLabel: string;
  loadingLabel: string;
  onNameChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onToggleIconPicker: () => void;
  onIconChange: (v: string) => void;
  onCloseIconPicker: () => void;
}

export function SpaceFormView({
  title,
  name,
  icon,
  showIconPicker,
  iconButtonRef,
  isLoading,
  error,
  submitLabel,
  loadingLabel,
  onNameChange,
  onSubmit,
  onBack,
  onToggleIconPicker,
  onIconChange,
  onCloseIconPicker,
}: SpaceFormViewProps) {
  const t = useTranslations("SpaceSwitcher");
  return (
    <>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={13} />
        </Button>
        <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div>
            <button
              ref={iconButtonRef}
              type="button"
              onClick={onToggleIconPicker}
              title={t("chooseIcon")}
              className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent focus:outline-none focus:border-accent transition-colors"
            >
              {icon ? <IconDisplay value={icon} size={18} /> : <Smile size={15} />}
            </button>
            {showIconPicker && (
              <IconPicker
                value={icon}
                onChange={(val) => {
                  onIconChange(val);
                  onCloseIconPicker();
                }}
                onClose={onCloseIconPicker}
                anchorEl={iconButtonRef.current}
              />
            )}
          </div>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder={t("spaceName")}
            className="flex-1 bg-surface border border-stroke rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        <Button onClick={onSubmit} loading={isLoading} disabled={!name.trim() || isLoading} className="w-full">
          {isLoading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </>
  );
}
