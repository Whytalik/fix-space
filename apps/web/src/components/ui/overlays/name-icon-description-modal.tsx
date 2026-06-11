"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Button } from "@/components/ui/primitives/actions/button";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { useEscape } from "@/hooks/ui/use-escape";
import { Smile } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

interface NameIconDescriptionValues {
  name: string;
  icon: string;
  description: string;
}

interface NameIconDescriptionModalProps {
  title: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  submitLabel: string;
  initialValues?: Partial<NameIconDescriptionValues>;
  isSubmitting: boolean;
  hint?: string;
  error?: string | null;
  onSubmit: (values: NameIconDescriptionValues) => void;
  onClose: () => void;
}

export function NameIconDescriptionModal({
  title,
  namePlaceholder,
  descriptionPlaceholder,
  submitLabel,
  initialValues,
  isSubmitting,
  hint,
  error,
  onSubmit,
  onClose,
}: NameIconDescriptionModalProps) {
  const t = useTranslations("NameIconColorModal");
  const [name, setName] = useState(initialValues?.name ?? "");
  const [icon, setIcon] = useState(initialValues?.icon ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEscape(
    useCallback(() => {
      if (showIconPicker) setShowIconPicker(false);
      else onClose();
    }, [showIconPicker, onClose]),
  );

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), icon: icon.trim(), description: description.trim() });
  }

  return (
    <ModalShell isOpen onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        {hint && <p className="type-hint">{hint}</p>}

        <div className="flex flex-col gap-1.5">
          <label className="type-field-label">{t("nameLabel") || "Name"}</label>
          <div className="flex gap-2">
            <div>
              <button
                ref={iconButtonRef}
                type="button"
                title={t("chooseIcon")}
                onClick={() => setShowIconPicker((prev) => !prev)}
                className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent focus:outline-none focus:border-accent transition-colors duration-150"
              >
                {icon ? <IconDisplay value={icon} size={18} /> : <Smile size={14} />}
              </button>
              {showIconPicker && (
                <IconPicker
                  value={icon}
                  onChange={(value) => {
                    setIcon(value);
                    setShowIconPicker(false);
                  }}
                  onClose={() => setShowIconPicker(false)}
                  anchorEl={iconButtonRef.current}
                />
              )}
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={namePlaceholder}
              className="field-input flex-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="type-field-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={descriptionPlaceholder}
            className="field-input min-h-20 py-2 resize-none"
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button className="w-full mt-2" loading={isSubmitting} disabled={!name.trim() || isSubmitting} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
