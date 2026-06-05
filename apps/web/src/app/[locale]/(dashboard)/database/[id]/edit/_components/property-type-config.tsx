"use client";

import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import type { DatabaseResponseDto, SelectCategory, SelectOption, StatusCategoryConfig, StatusOptionColor } from "@fixspace/domain";
import {
  DATA_FORMATS_VALUES,
  DEFAULT_STATUS_PROPERTY,
  NUMBER_FORMAT_VALUES,
  PropertyType,
  STATUS_OPTION_COLOR_VALUES,
  TIME_FORMATS_VALUES,
  URL_HANDLING_VALUES,
} from "@fixspace/domain/enums";
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
    element: HTMLElement;
    categoryIndex: number;
    optionIndex: number;
    propType: "select" | "status";
  } | null>(null);

  const selectCategories = (config.categories ?? []) as SelectCategory[];

  function addSelectCategory() {
    onPatch({ categories: [...selectCategories, { label: "", options: [] }] });
  }

  function removeSelectCategory(index: number) {
    onPatch({ categories: selectCategories.filter((_, i) => i !== index) });
  }

  function updateSelectCategoryLabel(index: number, label: string) {
    onPatch({ categories: selectCategories.map((category, i) => (i === index ? { ...category, label } : category)) });
  }

  function addSelectOption(categoryIndex: number) {
    onPatch({
      categories: selectCategories.map((category, i) =>
        i === categoryIndex ? { ...category, options: [...category.options, { value: "" } as SelectOption] } : category,
      ),
    });
  }

  function removeSelectOption(categoryIndex: number, optionIndex: number) {
    onPatch({
      categories: selectCategories.map((category, i) =>
        i === categoryIndex ? { ...category, options: category.options.filter((_, j) => j !== optionIndex) } : category,
      ),
    });
  }

  function updateSelectOption(categoryIndex: number, optionIndex: number, value: string) {
    onPatch({
      categories: selectCategories.map((category, i) =>
        i === categoryIndex
          ? { ...category, options: category.options.map((option, j) => (j === optionIndex ? { ...option, value } : option)) }
          : category,
      ),
    });
  }

  function updateSelectOptionColor(categoryIndex: number, optionIndex: number, color: string) {
    onPatch({
      categories: selectCategories.map((category, i) =>
        i === categoryIndex
          ? { ...category, options: category.options.map((option, j) => (j === optionIndex ? { ...option, color } : option)) }
          : category,
      ),
    });
  }

  function updateSelectOptionIcon(categoryIndex: number, optionIndex: number, icon: string) {
    onPatch({
      categories: selectCategories.map((category, i) =>
        i === categoryIndex
          ? { ...category, options: category.options.map((option, j) => (j === optionIndex ? { ...option, icon } : option)) }
          : category,
      ),
    });
  }

  const statusCategories = (config.categories ?? DEFAULT_STATUS_PROPERTY.categories) as StatusCategoryConfig[];
  const allStatusOptions = statusCategories.flatMap((category) => category.options.map((option) => option.name));

  function addStatusOption(categoryIndex: number) {
    onPatch({
      categories: statusCategories.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              options: [...category.options, { name: "New option", color: STATUS_OPTION_COLOR_VALUES[0] as StatusOptionColor }],
            }
          : category,
      ),
    });
  }

  function removeStatusOption(categoryIndex: number, optionIndex: number) {
    onPatch({
      categories: statusCategories.map((category, i) =>
        i === categoryIndex ? { ...category, options: category.options.filter((_, j) => j !== optionIndex) } : category,
      ),
    });
  }

  function updateStatusOptionName(categoryIndex: number, optionIndex: number, optName: string) {
    onPatch({
      categories: statusCategories.map((category, i) =>
        i === categoryIndex
          ? { ...category, options: category.options.map((option, j) => (j === optionIndex ? { ...option, name: optName } : option)) }
          : category,
      ),
    });
  }

  function updateStatusOptionColor(categoryIndex: number, optionIndex: number, color: StatusOptionColor) {
    onPatch({
      categories: statusCategories.map((category, i) =>
        i === categoryIndex
          ? { ...category, options: category.options.map((option, j) => (j === optionIndex ? { ...option, color } : option)) }
          : category,
      ),
    });
  }

  function updateStatusOptionIcon(categoryIndex: number, optionIndex: number, icon: string) {
    onPatch({
      categories: statusCategories.map((category, i) =>
        i === categoryIndex
          ? { ...category, options: category.options.map((option, j) => (j === optionIndex ? { ...option, icon } : option)) }
          : category,
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
            <Toggle value={Boolean(config.isRichText)} onChange={(value) => onPatch({ isRichText: value })} />
          </label>
          <div>
            <p className="type-field-label mb-1">URL handling</p>
            <select
              value={String(config.urlHandling ?? "none")}
              onChange={(e) => onPatch({ urlHandling: e.target.value })}
              className="field-input w-full"
            >
              {URL_HANDLING_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value === "none" ? "None" : value === "detect" ? "Detect links" : "Show preview"}
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
              {NUMBER_FORMAT_VALUES.map((format) => (
                <option key={format} value={format}>
                  {format.charAt(0).toUpperCase() + format.slice(1)}
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
              {DATA_FORMATS_VALUES.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink">Include time</p>
            <Toggle value={Boolean(config.includeTime)} onChange={(value) => onPatch({ includeTime: value })} />
          </label>
          {Boolean(config.includeTime) && (
            <div>
              <p className="type-field-label mb-1">Time format</p>
              <select
                value={String(config.timeFormat ?? TIME_FORMATS_VALUES[0])}
                onChange={(e) => onPatch({ timeFormat: e.target.value })}
                className="field-input w-full"
              >
                {TIME_FORMATS_VALUES.map((format) => (
                  <option key={format} value={format}>
                    {format}
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
          <Toggle value={Boolean(config.defaultValue)} onChange={(value) => onPatch({ defaultValue: value })} />
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
            <Toggle value={Boolean(config.isMultiSelect)} onChange={(value) => onPatch({ isMultiSelect: value })} />
          </label>

          <div className="flex flex-col gap-2">
            <p className="type-field-label">Categories &amp; options</p>
            {selectCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="rounded-lg border border-stroke overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-surface">
                  <input
                    type="text"
                    value={category.label}
                    onChange={(e) => updateSelectCategoryLabel(categoryIndex, e.target.value)}
                    placeholder="Category label…"
                    className="flex-1 text-xs font-medium bg-transparent outline-none text-ink placeholder:text-ink-muted"
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectCategory(categoryIndex)}
                    className="text-ink-muted hover:text-error shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {(category.options as SelectOption[]).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2 px-3 py-1.5 border-t border-stroke">
                    {option.color && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />}
                    <button
                      type="button"
                      onClick={(e) => setIconPickerState({ element: e.currentTarget, categoryIndex, optionIndex, propType: "select" })}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0"
                    >
                      {option.icon ? <IconDisplay value={option.icon} size={12} /> : <ImageIcon size={11} className="text-ink-muted" />}
                    </button>
                    <input
                      type="text"
                      value={typeof option === "string" ? option : option.value}
                      onChange={(e) => updateSelectOption(categoryIndex, optionIndex, e.target.value)}
                      placeholder="Option…"
                      className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-ink-muted"
                    />
                    <div className="flex items-center gap-0.5">
                      {STATUS_OPTION_COLOR_VALUES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateSelectOptionColor(categoryIndex, optionIndex, color)}
                          className={`w-3 h-3 rounded-full transition-transform hover:scale-110 ${option.color === color ? "ring-1 ring-offset-1 ring-ink scale-110" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectOption(categoryIndex, optionIndex)}
                      className="text-ink-muted hover:text-error shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSelectOption(categoryIndex)}
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
              value={(selectCategories[iconPickerState.categoryIndex]?.options[iconPickerState.optionIndex] as SelectOption)?.icon ?? ""}
              onChange={(icon) => {
                updateSelectOptionIcon(iconPickerState.categoryIndex, iconPickerState.optionIndex, icon);
                setIconPickerState(null);
              }}
              onClose={() => setIconPickerState(null)}
              anchorEl={iconPickerState.element}
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
              {allStatusOptions.map((optionName) => (
                <option key={optionName} value={optionName}>
                  {optionName}
                </option>
              ))}
            </select>
          </div>

          {statusCategories.map((category, categoryIndex) => (
            <div key={category.category}>
              <p className="text-tiny font-semibold uppercase tracking-widest text-ink-secondary mb-2">
                {STATUS_CATEGORY_LABELS[category.category] ?? category.category}
              </p>
              <div className="rounded-lg border border-stroke overflow-hidden">
                {category.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2 px-3 py-2 border-b border-stroke last:border-b-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
                    <button
                      type="button"
                      onClick={(e) => setIconPickerState({ element: e.currentTarget, categoryIndex, optionIndex, propType: "status" })}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0"
                    >
                      {option.icon ? <IconDisplay value={option.icon} size={12} /> : <ImageIcon size={11} className="text-ink-muted" />}
                    </button>
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => updateStatusOptionName(categoryIndex, optionIndex, e.target.value)}
                      className="flex-1 text-xs bg-transparent outline-none text-ink"
                    />
                    <div className="flex items-center gap-0.5">
                      {STATUS_OPTION_COLOR_VALUES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateStatusOptionColor(categoryIndex, optionIndex, color as StatusOptionColor)}
                          className={`w-3 h-3 rounded-full transition-transform hover:scale-110 ${option.color === color ? "ring-1 ring-offset-1 ring-ink scale-110" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStatusOption(categoryIndex, optionIndex)}
                      className="text-ink-muted hover:text-error shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addStatusOption(categoryIndex)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors"
                >
                  <Plus size={11} /> Add option
                </button>
              </div>
            </div>
          ))}
          {iconPickerState?.propType === "status" && (
            <IconPicker
              value={statusCategories[iconPickerState.categoryIndex]?.options[iconPickerState.optionIndex]?.icon ?? ""}
              onChange={(icon) => {
                updateStatusOptionIcon(iconPickerState.categoryIndex, iconPickerState.optionIndex, icon);
                setIconPickerState(null);
              }}
              onClose={() => setIconPickerState(null)}
              anchorEl={iconPickerState.element}
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
                options={databases.map((database) => ({ value: database.id, label: database.title ?? database.name }))}
                value={String(config.relatedEntityId ?? "")}
                onChange={(value) => onPatch({ relatedEntityId: value || undefined })}
                placeholder="Select database"
                nullable
              />
            </div>
          </div>
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink">Multiple values</p>
              <p className="text-xs text-ink-muted mt-0.5">Allow linking to many records</p>
            </div>
            <Toggle value={Boolean(config.multiple ?? true)} onChange={(value) => onPatch({ multiple: value })} />
          </label>
        </div>
      );

    default:
      return null;
  }
}
