"use client";

import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { useMutation } from "@/hooks/useMutation";
import { updateSpace } from "@/lib/api/space";
import { Button } from "@/components/ui/primitives/button";
import { Smile, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

interface CreateSectionModalProps {
  onClose: () => void;
}

export function CreateSectionModal({ onClose }: CreateSectionModalProps) {
  const { space, updateSpaceInList } = useAppContext();
  const t = useTranslations("CreateSectionModal");

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    onClose();
  }

  useEscape(
    useCallback(() => {
      if (!name && !icon && !color) {
        onClose();
        return;
      }
      if (showIconPicker) setShowIconPicker(false);
      else if (showColorPicker) setShowColorPicker(false);
      else onClose();
    }, [showIconPicker, showColorPicker, name, icon, color, onClose]),
  );

  const { mutate: createSection, isLoading: isCreating } = useMutation(async () => {
    if (!space) return;
    const updated = await updateSpace(space.id, {
      sectionOperations: [
        {
          operation: "CREATE",
          create: {
            name: name.trim(),
            icon: icon.trim() || undefined,
            color: color.trim() || undefined,
          },
        },
      ],
    });
    updateSpaceInList(updated);
  });

  async function handleCreate() {
    if (!name.trim()) return;
    const ok = await createSection();
    if (ok) onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={handleClose}
    >
      <div
        className="w-105 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
            {t("newSection")}
          </span>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X size={13} />
          </Button>
        </div>
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <div>
              <button
                ref={iconButtonRef}
                type="button"
                onClick={() => {
                  setShowIconPicker((v) => !v);
                  setShowColorPicker(false);
                }}
                title={t("chooseIcon")}
                className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent focus:outline-none focus:border-accent transition-colors"
              >
                {icon ? <IconDisplay value={icon} size={18} /> : <Smile size={15} />}
              </button>
              {showIconPicker && (
                <IconPicker
                  value={icon}
                  onChange={(val) => {
                    setIcon(val);
                    setShowIconPicker(false);
                  }}
                  onClose={() => setShowIconPicker(false)}
                  anchorEl={iconButtonRef.current}
                />
              )}
            </div>
            <div>
              <button
                ref={colorButtonRef}
                type="button"
                onClick={() => {
                  setShowColorPicker((v) => !v);
                  setShowIconPicker(false);
                }}
                title={t("chooseColor")}
                className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center hover:border-accent focus:outline-none focus:border-accent transition-colors overflow-hidden"
              >
                {color ? (
                  <span className="w-full h-full rounded-lg" style={{ backgroundColor: color }} />
                ) : (
                  <span className="w-4 h-4 rounded-sm border-2 border-dashed border-ink-muted" />
                )}
              </button>
              {showColorPicker && (
                <ColorPicker
                  value={color}
                  onChange={setColor}
                  onClose={() => setShowColorPicker(false)}
                  anchorEl={colorButtonRef.current}
                />
              )}
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder={t("sectionName")}
              className="flex-1 bg-surface border border-stroke rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
            />
          </div>
          <Button className="w-full" loading={isCreating} disabled={!name.trim() || isCreating} onClick={handleCreate}>
            {isCreating ? t("creating") : t("addSectionBtn")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
