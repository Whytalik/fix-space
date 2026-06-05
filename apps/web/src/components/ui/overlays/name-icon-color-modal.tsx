"use client";

import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Button } from "@/components/ui/primitives/actions/button";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { useEscape } from "@/hooks/useEscape";
import { Smile } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

interface NameIconColorValues {
  name: string;
  icon: string;
  color: string;
}

interface NameIconColorModalProps {
  title: string;
  placeholder: string;
  submitLabel: string;
  initialValues?: Partial<NameIconColorValues>;
  isSubmitting: boolean;
  hideColor?: boolean;
  hint?: string;
  error?: string | null;
  onSubmit: (values: NameIconColorValues) => void;
  onClose: () => void;
}

export function NameIconColorModal({
  title,
  placeholder,
  submitLabel,
  initialValues,
  isSubmitting,
  hideColor,
  hint,
  error,
  onSubmit,
  onClose,
}: NameIconColorModalProps) {
  const t = useTranslations("NameIconColorModal");
  const [name, setName] = useState(initialValues?.name ?? "");
  const [icon, setIcon] = useState(initialValues?.icon ?? "");
  const [color, setColor] = useState(initialValues?.color ?? "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  useEscape(
    useCallback(() => {
      if (showIconPicker) setShowIconPicker(false);
      else if (showColorPicker) setShowColorPicker(false);
      else onClose();
    }, [showIconPicker, showColorPicker, onClose]),
  );

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), icon: icon.trim(), color: color.trim() });
  }

  return (
    <ModalShell isOpen onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div>
            <button
              ref={iconButtonRef}
              type="button"
              title={t("chooseIcon")}
              onClick={() => {
                setShowIconPicker((prev) => !prev);
                setShowColorPicker(false);
              }}
              className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent focus:outline-none focus:border-accent transition-colors duration-150"
            >
              {icon ? <IconDisplay value={icon} size={18} /> : <Smile size={14} />}
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
          {!hideColor && (
            <div>
              <button
                ref={colorButtonRef}
                type="button"
                title={t("chooseColor")}
                onClick={() => {
                  setShowColorPicker((prev) => !prev);
                  setShowIconPicker(false);
                }}
                className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center hover:border-accent focus:outline-none focus:border-accent transition-colors duration-150 overflow-hidden"
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
          )}
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholder}
            className="field-input flex-1"
          />
        </div>
        {hint && <p className="type-hint">{hint}</p>}
        {error && <p className="text-sm text-error">{error}</p>}
        <Button className="w-full" loading={isSubmitting} disabled={!name.trim() || isSubmitting} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
