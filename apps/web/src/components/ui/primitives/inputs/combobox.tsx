"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { ComboboxDropdown } from "./combobox-dropdown";

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: string | null;
  color?: string;
}

type ComboboxProps =
  | {
      options: ComboboxOption[];
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      /** Allow typing any value not in the list */
      freeText?: boolean;
      /** Clicking the active option deselects it (sets to "") */
      nullable?: boolean;
      /** Which direction the dropdown opens; defaults to "bottom" */
      placement?: "top" | "bottom";
      /** Input height variant; "md" is default, "sm" is more compact */
      size?: "md" | "sm";
      multiple?: false;
    }
  | {
      options: ComboboxOption[];
      value: string[];
      onChange: (value: string[]) => void;
      placeholder?: string;
      placement?: "top" | "bottom";
      /** Input height variant; "md" is default, "sm" is more compact */
      size?: "md" | "sm";
      multiple: true;
    };

export function Combobox(props: ComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (props.multiple) {
    const { placement = "bottom", size = "md" } = props;
    const inputCls = size === "sm" ? "field-input w-full !py-1 !text-xs" : "field-input w-full";
    const selected = props.options.filter((option) => (props.value as string[]).includes(option.value));
    const available = props.options.filter(
      (option) => !(props.value as string[]).includes(option.value) && option.label.toLowerCase().includes(query.toLowerCase()),
    );

    function handleAdd(value: string) {
      (props.onChange as (value: string[]) => void)([...(props.value as string[]), value]);
      setQuery("");
      inputRef.current?.focus();
    }

    function handleRemove(value: string) {
      (props.onChange as (value: string[]) => void)((props.value as string[]).filter((v) => v !== value));
    }

    return (
      <div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selected.map((option) => (
              <span
                key={option.value}
                className={
                  option.color
                    ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                    : "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-stroke text-xs text-ink"
                }
                style={option.color ? { backgroundColor: `${option.color}20`, color: option.color } : undefined}
              >
                {option.icon && <IconDisplay value={option.icon} size={12} />}
                {option.label}
                <button type="button" onClick={() => handleRemove(option.value)} className="text-ink-muted hover:text-ink">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={selected.length === 0 ? (props.placeholder ?? "Search…") : "Add more…"}
            className={inputCls}
          />
          {open && available.length > 0 && (
            <ComboboxDropdown options={available} onSelect={(value) => handleAdd(value)} placement={placement} />
          )}
        </div>
      </div>
    );
  }

  const {
    freeText = false,
    nullable = false,
    placement = "bottom",
    size = "md",
  } = props as { freeText?: boolean; nullable?: boolean; placement?: "top" | "bottom"; size?: "md" | "sm" };
  const inputCls = size === "sm" ? "field-input w-full !py-1 !text-xs" : "field-input w-full";
  const currentLabel = freeText ? (props.value as string) : (props.options.find((option) => option.value === props.value)?.label ?? "");

  const filtered = props.options.filter((option) => query === currentLabel || option.label.toLowerCase().includes(query.toLowerCase()));

  function handleFocus() {
    setQuery(currentLabel);
    setOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
    if (freeText) (props.onChange as (value: string) => void)(e.target.value);
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false);
      setQuery("");
    }, 150);
  }

  function handleSelect(value: string) {
    const isSame = value === props.value;
    (props.onChange as (value: string) => void)(nullable && isSame ? "" : value);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={open ? query : currentLabel}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={props.placeholder}
        className={inputCls}
      />
      {open && filtered.length > 0 && (
        <ComboboxDropdown options={filtered} onSelect={handleSelect} selectedValue={props.value as string} placement={placement} />
      )}
    </div>
  );
}
