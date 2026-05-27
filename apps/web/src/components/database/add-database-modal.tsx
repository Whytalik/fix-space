"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { useMutation } from "@/hooks/useMutation";
import { createDatabase } from "@/lib/api/database";
import { Button } from "@/components/ui/primitives/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface AddDatabaseModalProps {
  spaceId: string;
  sectionId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AddDatabaseModal({ spaceId, sectionId, onClose, onSaved }: AddDatabaseModalProps) {
  const t = useTranslations("AddDatabaseModal");
  const router = useRouter();
  const { addDatabaseToSpace } = useAppContext();
  const [icon, setIcon] = useState("");
  const [title, setTitle] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const createdIdRef = useRef<string | null>(null);
  const {
    mutate: save,
    isLoading: isSaving,
    error,
  } = useMutation(async () => {
    const created = await createDatabase(spaceId, {
      icon: icon || undefined,
      sectionId: sectionId,
      title,
      name: `[DB] ${title}`,
    });
    addDatabaseToSpace(created);
    createdIdRef.current = created.id;
  });

  useEscape(() => {
    if (showIconPicker) setShowIconPicker(false);
    else onClose();
  });

  function handleToggleIconPicker() {
    setShowIconPicker((v) => !v);
  }

  function handleIconChange(val: string) {
    setIcon(val);
    setShowIconPicker(false);
  }

  function handleIconPickerClose() {
    setShowIconPicker(false);
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  async function handleSave() {
    const ok = await save();
    if (ok && createdIdRef.current) {
      onSaved();
      router.push(`/database/${createdIdRef.current}/edit`);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-105 overflow-hidden rounded-2xl border border-stroke bg-elevated shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
          <h2 className="type-modal-title">{t("addDatabase")}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 type-field-label">{t("icon")}</label>
            <div>
              <button
                ref={iconButtonRef}
                type="button"
                onClick={handleToggleIconPicker}
                className="flex items-center gap-2.5 w-full rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
              >
                {icon ? (
                  <span className="flex items-center gap-2">
                    <IconDisplay value={icon} size={18} />
                    <span className="text-ink-secondary text-xs">
                      {icon.startsWith("icon:") ? icon.slice(5) : icon}
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-muted">{t("chooseIcon")}</span>
                )}
              </button>
              {showIconPicker && (
                <IconPicker
                  value={icon}
                  onChange={handleIconChange}
                  onClose={handleIconPickerClose}
                  anchorEl={iconButtonRef.current}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1.5 type-field-label">{t("title")}</label>
            <input
              type="text"
              className="field-input"
              value={title}
              onChange={handleTitleChange}
              placeholder={t("placeholderTitle")}
            />
            <p className="mt-1.5 type-hint">
              {t("internalName")}{" "}
              <span className="font-mono text-ink-secondary">[DB] {title || t("placeholderTitle")}</span>
            </p>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stroke px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} loading={isSaving} disabled={isSaving || !title.trim()}>
            {isSaving ? t("creating") : t("createDatabase")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
