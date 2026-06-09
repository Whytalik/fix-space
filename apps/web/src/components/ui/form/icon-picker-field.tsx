"use client";

import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useRef, useState } from "react";

interface IconPickerFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function IconPickerField({ value, onChange, placeholder = "Choose an icon…" }: IconPickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowPicker((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
      >
        {value ? (
          <span className="flex items-center gap-2">
            <IconDisplay value={value} size={16} />
            <span className="text-xs text-ink-secondary">{getAllIcons().find((icon) => `icon:${icon.name}` === value)?.displayName}</span>
          </span>
        ) : (
          <span className="text-ink-muted">{placeholder}</span>
        )}
      </button>
      {showPicker && (
        <IconPicker
          value={value ?? ""}
          onChange={(value) => {
            onChange(value);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
          anchorEl={buttonRef.current}
        />
      )}
    </div>
  );
}
