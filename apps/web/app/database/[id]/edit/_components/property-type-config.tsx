"use client";

import { Combobox } from "@/components/ui/primitives/combobox";
import { Toggle } from "@/components/ui/primitives/toggle";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import type {
  DatabaseResponseDto,
  SelectCategory,
  SelectOption,
  StatusCategoryConfig,
  StatusOptionColor,
} from "@fixspace/domain";
import {
  DATA_FORMATS_VALUES,
  DEFAULT_STATUS_PROPERTY,
  NUMBER_FORMAT_VALUES,
  PropertyType,
  STATUS_OPTION_COLOR_VALUES,
  TIME_FORMATS_VALUES,
  URL_HANDLING_VALUES,
} from "@fixspace/domain/enums";

const FORMULA_OUTPUT_TYPE_VALUES = ["text", "number", "checkbox", "date", "relation", "array"] as const;
import { Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

type PropertyTypeConfigProps = {
  type: PropertyType;
  config: Record<string, unknown>;
  databases: DatabaseResponseDto[];
  isViewMode: boolean;
  onPatch: (patch: Record<string, unknown>) => void;
};

const STATUS_CATEGORY_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  complete: "Complete",
};

export function PropertyTypeConfig({ type, config, databases, onPatch }: PropertyTypeConfigProps) {
  const [iconPickerState, setIconPickerState] = useState<{
    el: HTMLElement;
    catIdx: number;
    optIdx: number;
    propType: "select" | "status";
  } | null>(null);

  const selectCategories = (config.categories ?? []) as SelectCategory[];

  function addSelectCategory() {
    onPatch({ categories: [...selectCategories, { label: "", options: [] }] });
  }

  function removeSelectCategory(idx: number) {
    onPatch({ categories: selectCategories.filter((_, i) => i !== idx) });
  }

  function updateSelectCategoryLabel(idx: number, label: string) {
    onPatch({ categories: selectCategories.map((c, i) => (i === idx ? { ...c, label } : c)) });
  }

  function addSelectOption(catIdx: number) {
    onPatch({
      categories: selectCategories.map((c, i) =>
        i === catIdx ? { ...c, options: [...c.options, { value: "" } as SelectOption] } : c,
      ),
    });
  }

  function removeSelectOption(catIdx: number, optIdx: number) {
    onPatch({
      categories: selectCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.filter((_, j) => j !== optIdx) } : c,
      ),
    });
  }

  function updateSelectOption(catIdx: number, optIdx: number, value: string) {
    onPatch({
      categories: selectCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.map((o, j) => (j === optIdx ? { ...o, value } : o)) } : c,
      ),
    });
  }

  function updateSelectOptionColor(catIdx: number, optIdx: number, color: string) {
    onPatch({
      categories: selectCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.map((o, j) => (j === optIdx ? { ...o, color } : o)) } : c,
      ),
    });
  }

  function updateSelectOptionIcon(catIdx: number, optIdx: number, icon: string) {
    onPatch({
      categories: selectCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.map((o, j) => (j === optIdx ? { ...o, icon } : o)) } : c,
      ),
    });
  }

  const statusCategories = (config.categories ?? DEFAULT_STATUS_PROPERTY.categories) as StatusCategoryConfig[];
  const allStatusOptions = statusCategories.flatMap((c) => c.options.map((o) => o.name));

  function addStatusOption(catIdx: number) {
    onPatch({
      categories: statusCategories.map((c, i) =>
        i === catIdx
          ? {
              ...c,
              options: [
                ...c.options,
                { name: "New option", color: STATUS_OPTION_COLOR_VALUES[0] as StatusOptionColor },
              ],
            }
          : c,
      ),
    });
  }

  function removeStatusOption(catIdx: number, optIdx: number) {
    onPatch({
      categories: statusCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.filter((_, j) => j !== optIdx) } : c,
      ),
    });
  }

  function updateStatusOptionName(catIdx: number, optIdx: number, optName: string) {
    onPatch({
      categories: statusCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.map((o, j) => (j === optIdx ? { ...o, name: optName } : o)) } : c,
      ),
    });
  }

  function updateStatusOptionColor(catIdx: number, optIdx: number, color: StatusOptionColor) {
    onPatch({
      categories: statusCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.map((o, j) => (j === optIdx ? { ...o, color } : o)) } : c,
      ),
    });
  }

  function updateStatusOptionIcon(catIdx: number, optIdx: number, icon: string) {
    onPatch({
      categories: statusCategories.map((c, i) =>
        i === catIdx ? { ...c, options: c.options.map((o, j) => (j === optIdx ? { ...o, icon } : o)) } : c,
      ),
    });
  }

  switch (type) {
    case PropertyType.TEXT:
      return (
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink">Rich text</p>
              <p className="text-xs text-ink-muted mt-0.5">Enable markdown / block-level editing</p>
            </div>
            <Toggle value={Boolean(config.isRichText)} onChange={(v) => onPatch({ isRichText: v })} />
          </label>
          <div>
            <p className="type-field-label mb-1">URL handling</p>
            <select
              value={String(config.urlHandling ?? "none")}
              onChange={(e) => onPatch({ urlHandling: e.target.value })}
              className="field-input w-full"
            >
              {URL_HANDLING_VALUES.map((v) => (
                <option key={v} value={v}>
                  {v === "none" ? "None" : v === "detect" ? "Detect links" : "Show preview"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="type-field-label mb-1">Default value</p>
            <input
              type="text"
              value={String(config.defaultValue ?? "")}
              onChange={(e) => onPatch({ defaultValue: e.target.value })}
              placeholder="Default text…"
              className="field-input w-full"
            />
          </div>
        </div>
      );

    case PropertyType.NUMBER:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">Format</p>
            <select
              value={String(config.format ?? "float")}
              onChange={(e) => onPatch({ format: e.target.value })}
              className="field-input w-full"
            >
              {NUMBER_FORMAT_VALUES.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {(config.format === "float" || config.format === "currency") && (
            <div>
              <p className="type-field-label mb-1">Decimal places</p>
              <input
                type="number"
                min={0}
                max={10}
                value={Number(config.decimalPlaces ?? 2)}
                onChange={(e) => onPatch({ decimalPlaces: Number(e.target.value) })}
                className="field-input w-full"
              />
            </div>
          )}
          {config.format === "currency" && (
            <div>
              <p className="type-field-label mb-1">Currency symbol</p>
              <input
                type="text"
                maxLength={4}
                value={String(config.currencySymbol ?? "$")}
                onChange={(e) => onPatch({ currencySymbol: e.target.value })}
                className="field-input w-full"
              />
            </div>
          )}
          <div>
            <p className="type-field-label mb-1">Default value</p>
            <input
              type="number"
              value={Number(config.defaultValue ?? 0)}
              onChange={(e) => onPatch({ defaultValue: Number(e.target.value) })}
              className="field-input w-full"
            />
          </div>
        </div>
      );

    case PropertyType.DATE:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">Date format</p>
            <select
              value={String(config.format ?? DATA_FORMATS_VALUES[0])}
              onChange={(e) => onPatch({ format: e.target.value })}
              className="field-input w-full"
            >
              {DATA_FORMATS_VALUES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink">Include time</p>
            <Toggle value={Boolean(config.includeTime)} onChange={(v) => onPatch({ includeTime: v })} />
          </label>
          {Boolean(config.includeTime) && (
            <div>
              <p className="type-field-label mb-1">Time format</p>
              <select
                value={String(config.timeFormat ?? TIME_FORMATS_VALUES[0])}
                onChange={(e) => onPatch({ timeFormat: e.target.value })}
                className="field-input w-full"
              >
                {TIME_FORMATS_VALUES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      );

    case PropertyType.CHECKBOX:
      return (
        <label className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink">Default checked</p>
          <Toggle value={Boolean(config.defaultValue)} onChange={(v) => onPatch({ defaultValue: v })} />
        </label>
      );

    case PropertyType.SELECT:
      return (
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink">Multi-select</p>
              <p className="text-xs text-ink-muted mt-0.5">Allow selecting multiple values</p>
            </div>
            <Toggle value={Boolean(config.isMultiSelect)} onChange={(v) => onPatch({ isMultiSelect: v })} />
          </label>

          <div className="flex flex-col gap-2">
            <p className="type-field-label">Categories &amp; options</p>
            {selectCategories.map((cat, catIdx) => (
              <div key={catIdx} className="rounded-lg border border-stroke overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-surface">
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => updateSelectCategoryLabel(catIdx, e.target.value)}
                    placeholder="Category label…"
                    className="flex-1 text-xs font-medium bg-transparent outline-none text-ink placeholder:text-ink-muted"
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectCategory(catIdx)}
                    className="text-ink-muted hover:text-error shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {(cat.options as SelectOption[]).map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2 px-3 py-1.5 border-t border-stroke">
                    {opt.color && (
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                    )}
                    <button
                      type="button"
                      onClick={(e) => setIconPickerState({ el: e.currentTarget, catIdx, optIdx, propType: "select" })}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0"
                    >
                      {opt.icon ? (
                        <IconDisplay value={opt.icon} size={12} />
                      ) : (
                        <ImageIcon size={11} className="text-ink-muted" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={typeof opt === "string" ? opt : opt.value}
                      onChange={(e) => updateSelectOption(catIdx, optIdx, e.target.value)}
                      placeholder="Option…"
                      className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-ink-muted"
                    />
                    <div className="flex items-center gap-0.5">
                      {STATUS_OPTION_COLOR_VALUES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateSelectOptionColor(catIdx, optIdx, color)}
                          className={`w-3 h-3 rounded-full transition-transform hover:scale-110 ${opt.color === color ? "ring-1 ring-offset-1 ring-ink scale-110" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectOption(catIdx, optIdx)}
                      className="text-ink-muted hover:text-error shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSelectOption(catIdx)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 border-t border-stroke text-xs text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors"
                >
                  <Plus size={11} /> Add option
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSelectCategory}
              className="self-start flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
            >
              <Plus size={12} /> Add category
            </button>
          </div>
          {iconPickerState?.propType === "select" && (
            <IconPicker
              value={
                (selectCategories[iconPickerState.catIdx]?.options[iconPickerState.optIdx] as SelectOption)?.icon ?? ""
              }
              onChange={(icon) => {
                updateSelectOptionIcon(iconPickerState.catIdx, iconPickerState.optIdx, icon);
                setIconPickerState(null);
              }}
              onClose={() => setIconPickerState(null)}
              anchorEl={iconPickerState.el}
            />
          )}
        </div>
      );

    case PropertyType.STATUS:
      return (
        <div className="flex flex-col gap-5">
          <div>
            <p className="type-field-label mb-1">Default option</p>
            <select
              value={String(config.defaultOption ?? "")}
              onChange={(e) => onPatch({ defaultOption: e.target.value })}
              className="field-input w-full"
            >
              {allStatusOptions.map((optName) => (
                <option key={optName} value={optName}>
                  {optName}
                </option>
              ))}
            </select>
          </div>

          {statusCategories.map((cat, catIdx) => (
            <div key={cat.category}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-secondary mb-2">
                {STATUS_CATEGORY_LABELS[cat.category] ?? cat.category}
              </p>
              <div className="rounded-lg border border-stroke overflow-hidden">
                {cat.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className="flex items-center gap-2 px-3 py-2 border-b border-stroke last:border-b-0"
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                    <button
                      type="button"
                      onClick={(e) => setIconPickerState({ el: e.currentTarget, catIdx, optIdx, propType: "status" })}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0"
                    >
                      {opt.icon ? (
                        <IconDisplay value={opt.icon} size={12} />
                      ) : (
                        <ImageIcon size={11} className="text-ink-muted" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateStatusOptionName(catIdx, optIdx, e.target.value)}
                      className="flex-1 text-xs bg-transparent outline-none text-ink"
                    />
                    <div className="flex items-center gap-0.5">
                      {STATUS_OPTION_COLOR_VALUES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateStatusOptionColor(catIdx, optIdx, color as StatusOptionColor)}
                          className={`w-3 h-3 rounded-full transition-transform hover:scale-110 ${opt.color === color ? "ring-1 ring-offset-1 ring-ink scale-110" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStatusOption(catIdx, optIdx)}
                      className="text-ink-muted hover:text-error shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addStatusOption(catIdx)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors"
                >
                  <Plus size={11} /> Add option
                </button>
              </div>
            </div>
          ))}
          {iconPickerState?.propType === "status" && (
            <IconPicker
              value={statusCategories[iconPickerState.catIdx]?.options[iconPickerState.optIdx]?.icon ?? ""}
              onChange={(icon) => {
                updateStatusOptionIcon(iconPickerState.catIdx, iconPickerState.optIdx, icon);
                setIconPickerState(null);
              }}
              onClose={() => setIconPickerState(null)}
              anchorEl={iconPickerState.el}
            />
          )}
        </div>
      );

    case PropertyType.RELATION:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">Related database</p>
            <div className="mt-1">
              <Combobox
                options={databases.map((db) => ({ value: db.id, label: db.title ?? db.name }))}
                value={String(config.relatedEntityId ?? "")}
                onChange={(v) => onPatch({ relatedEntityId: v || undefined })}
                placeholder="— Select database —"
                nullable
              />
            </div>
          </div>
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink">Multiple values</p>
              <p className="text-xs text-ink-muted mt-0.5">Allow linking to many records</p>
            </div>
            <Toggle value={Boolean(config.multiple ?? true)} onChange={(v) => onPatch({ multiple: v })} />
          </label>
        </div>
      );

    case PropertyType.FORMULA:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">Formula expression</p>
            <textarea
              rows={3}
              value={String(config.formula ?? "")}
              onChange={(e) => onPatch({ formula: e.target.value })}
              placeholder="e.g. prop('Price') * prop('Quantity')"
              className="field-input w-full resize-none font-mono text-xs"
            />
          </div>
          <div>
            <p className="type-field-label mb-1">Output type</p>
            <select
              value={String((config.output as Record<string, unknown>)?.type ?? "text")}
              onChange={(e) => onPatch({ output: { type: e.target.value } })}
              className="field-input w-full"
            >
              {FORMULA_OUTPUT_TYPE_VALUES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      );

    default:
      return null;
  }
}
