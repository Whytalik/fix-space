"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Zap, Clock, Calendar, ChevronDown } from "lucide-react";
import { DatePickerPopup } from "@/components/ui/date-picker/date-picker-popup";
import { DropdownMenu, type DropdownMenuItem } from "@/components/ui/overlays/dropdown-menu";

interface DateActionInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function DateActionInput({ value, onChange }: DateActionInputProps) {
  const t = useTranslations("Automation.dateValue");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const buttonReference = useRef<HTMLButtonElement>(null);

  const inputValue = value ?? "";
  const isToday = inputValue === "{{today}}" || inputValue === "{{date}}" || inputValue === "$today" || inputValue === "$date";
  const isTomorrow = inputValue === "{{tomorrow}}" || inputValue === "$tomorrow";
  const isSpecial = inputValue.startsWith("{{") || inputValue.startsWith("$");

  let label: string = t("custom");
  if (isToday) label = t("today");
  else if (isTomorrow) label = t("tomorrow");
  else if (inputValue) label = inputValue.split("T")[0] ?? "";

  const menuItems: DropdownMenuItem[] = [
    {
      label: t("today"),
      icon: <Zap size={12} className="text-accent" />,
      onClick: () => onChange("{{today}}"),
    },
    {
      label: t("tomorrow"),
      icon: <Clock size={12} className="text-ink-secondary" />,
      onClick: () => onChange("{{tomorrow}}"),
    },
    {
      label: t("custom") + "…",
      icon: <Calendar size={12} className="text-ink-secondary" />,
      onClick: () => setPickerOpen(true),
    },
  ];

  return (
    <>
      <button
        ref={buttonReference}
        type="button"
        onClick={() => setMenuOpen(true)}
        className="w-full h-9 px-3 flex items-center justify-between text-left text-sm rounded-lg border border-stroke bg-canvas text-ink hover:border-accent transition-colors duration-150 truncate"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {isSpecial ? <Zap size={12} className="text-accent shrink-0" /> : <Calendar size={12} className="text-ink-secondary shrink-0" />}
          <span className="truncate">{label}</span>
        </div>
        <ChevronDown size={12} className="text-ink-muted shrink-0" />
      </button>

      {menuOpen && <DropdownMenu anchorEl={buttonReference.current} onClose={() => setMenuOpen(false)} items={menuItems} />}

      {pickerOpen && (
        <DatePickerPopup
          value={isSpecial ? null : (value ?? null)}
          onChange={(selectedValue) => {
            onChange(selectedValue ? selectedValue.split("T")[0]! : "");
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
          anchorEl={buttonReference.current}
        />
      )}
    </>
  );
}
