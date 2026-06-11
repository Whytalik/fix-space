"use client";

import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import type {
  DatabaseResponseDto,
  PropertyResponseDto,
  SelectCategory,
  SelectOption,
  StatusCategoryConfig,
  StatusOptionColor,
  FormulaPropertyConfig,
} from "@fixspace/domain";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DATA_FORMATS_VALUES,
  DEFAULT_STATUS_PROPERTY,
  DURATION_FORMAT_VALUES,
  NUMBER_FORMAT_VALUES,
  PropertyType,
  STATUS_OPTION_COLOR_VALUES,
  TIME_FORMATS_VALUES,
} from "@fixspace/domain/enums";
import { Image as ImageIcon, Plus, Trash2, X, GripVertical } from "lucide-react";
import { useState } from "react";
import { FormulaConfig } from "./properties/formula-config";

type PropertyTypeConfigProps = {
  type: PropertyType;
  config: Record<string, unknown>;
  properties: PropertyResponseDto[];
  databases: DatabaseResponseDto[];
  isViewMode: boolean;
  onPatch: (patch: Record<string, unknown>) => void;
};

export function PropertyTypeConfig({ type, config, properties, databases, onPatch }: PropertyTypeConfigProps) {
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
    onPatch({ categories: selectCategories.filter((_, currentCategoryIndex) => currentCategoryIndex !== index) });
  }

  function updateSelectCategoryLabel(index: number, label: string) {
    onPatch({
      categories: selectCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === index ? { ...category, label } : category,
      ),
    });
  }

  function addSelectOption(categoryIndex: number) {
    onPatch({
      categories: selectCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex ? { ...category, options: [...category.options, { value: "" } as SelectOption] } : category,
      ),
    });
  }

  function removeSelectOption(categoryIndex: number, optionIndex: number) {
    onPatch({
      categories: selectCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? { ...category, options: category.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex) }
          : category,
      ),
    });
  }

  function updateSelectOption(categoryIndex: number, optionIndex: number, value: string) {
    onPatch({
      categories: selectCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              options: category.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, value } : option,
              ),
            }
          : category,
      ),
    });
  }

  function updateSelectOptionColor(categoryIndex: number, optionIndex: number, color: string) {
    onPatch({
      categories: selectCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              options: category.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, color } : option,
              ),
            }
          : category,
      ),
    });
  }

  function updateSelectOptionIcon(categoryIndex: number, optionIndex: number, icon: string) {
    onPatch({
      categories: selectCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              options: category.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, icon } : option,
              ),
            }
          : category,
      ),
    });
  }

  const statusCategories = (config.categories ?? DEFAULT_STATUS_PROPERTY.categories) as StatusCategoryConfig[];
  const allStatusOptions = statusCategories.flatMap((category) => category.options.map((option) => option.name));

  function updateStatusCategoryLabel(categoryIndex: number, label: string) {
    onPatch({
      categories: statusCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex ? { ...category, label } : category,
      ),
    });
  }

  function updateStatusCategoryDefaultOption(categoryIndex: number, defaultOption: string) {
    onPatch({
      categories: statusCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex ? { ...category, defaultOption } : category,
      ),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeContainer = statusCategories.find((category) => category.options.some((option) => option.name === active.id));
    const overContainer =
      statusCategories.find((category) => category.options.some((option) => option.name === over.id)) ||
      statusCategories.find((category) => category.category === over.id);

    if (!activeContainer || !overContainer) return;

    const activeOption = activeContainer.options.find((option) => option.name === active.id);
    if (!activeOption) return;

    onPatch({
      categories: statusCategories.map((category) => {
        if (category.category === activeContainer.category) {
          return { ...category, options: category.options.filter((option) => option.name !== active.id) };
        }
        if (category.category === overContainer.category) {
          const newOptions = [...category.options];
          const overIndex = overContainer.options.findIndex((option) => option.name === over.id);
          newOptions.splice(overIndex === -1 ? newOptions.length : overIndex, 0, activeOption);
          return { ...category, options: newOptions };
        }
        return category;
      }),
    });
  }

  function handleSelectDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCategoryIndex = selectCategories.findIndex((category) => category.label === active.id);
    const overCategoryIndex = selectCategories.findIndex((category) => category.label === over.id);

    if (activeCategoryIndex !== -1 && overCategoryIndex !== -1) {
      const newCategories = arrayMove(selectCategories, activeCategoryIndex, overCategoryIndex);
      onPatch({ categories: newCategories });
      return;
    }

    const activeContainer = selectCategories.find((category) => category.options.some((option) => option.value === active.id));
    const overContainer =
      selectCategories.find((category) => category.options.some((option) => option.value === over.id)) ||
      selectCategories.find((category) => category.label === over.id);

    if (!activeContainer || !overContainer) return;

    const activeOption = activeContainer.options.find((option) => option.value === active.id);
    if (!activeOption) return;

    onPatch({
      categories: selectCategories.map((category) => {
        if (category.label === activeContainer.label) {
          return { ...category, options: category.options.filter((option) => option.value !== active.id) };
        }
        if (category.label === overContainer.label) {
          const newOptions = [...category.options];
          const overIndex = overContainer.options.findIndex((option) => option.value === over.id);
          newOptions.splice(overIndex === -1 ? newOptions.length : overIndex, 0, activeOption);
          return { ...category, options: newOptions };
        }
        return category;
      }),
    });
  }

  function CategoryItem({ category, categoryIndex }: { category: SelectCategory; categoryIndex: number }) {
    const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: category.label });
    const style: React.CSSProperties = {
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition,
      opacity: isDragging ? 0.4 : undefined,
      zIndex: isDragging ? 10 : undefined,
    };

    return (
      <div ref={setNodeRef} style={style} className="rounded-lg border border-stroke overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface">
          <button type="button" className="cursor-grab text-ink-muted shrink-0" {...listeners}>
            <GripVertical size={14} />
          </button>
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
            className="text-ink-muted hover:text-error shrink-0 transition-colors duration-150"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <SortableContext items={category.options.map((option) => option.value)} strategy={verticalListSortingStrategy}>
          {(category.options as SelectOption[]).map((option, optionIndex) => (
            <SelectOptionItem key={option.value} categoryIndex={categoryIndex} optionIndex={optionIndex} option={option} />
          ))}
        </SortableContext>
        <button
          type="button"
          onClick={() => addSelectOption(categoryIndex)}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 border-t border-stroke text-xs text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors duration-150"
        >
          <Plus size={11} /> Add option
        </button>
      </div>
    );
  }

  function SelectOptionItem({ categoryIndex, optionIndex, option }: { categoryIndex: number; optionIndex: number; option: SelectOption }) {
    const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: option.value });
    const style: React.CSSProperties = {
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition,
      opacity: isDragging ? 0.4 : undefined,
      zIndex: isDragging ? 10 : undefined,
    };

    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2 px-3 py-1.5 border-t border-stroke bg-elevated">
        <button type="button" className="cursor-grab text-ink-muted shrink-0" {...listeners}>
          <GripVertical size={14} />
        </button>
        {option.color && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />}
        <button
          type="button"
          onClick={(e) => setIconPickerState({ element: e.currentTarget, categoryIndex, optionIndex, propType: "select" })}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0 transition-colors duration-150"
        >
          {option.icon ? <IconDisplay value={option.icon} size={12} /> : <ImageIcon size={11} className="text-ink-muted" />}
        </button>
        <input
          type="text"
          value={option.value}
          onChange={(e) => updateSelectOption(categoryIndex, optionIndex, e.target.value)}
          placeholder="Option…"
          className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-ink-muted"
        />
        <div className="flex items-center gap-0.5">
          {STATUS_OPTION_COLOR_VALUES.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateSelectOptionColor(categoryIndex, optionIndex, color as StatusOptionColor)}
              className={`w-3 h-3 rounded-full transition-transform hover:scale-110 ${option.color === color ? "ring-1 ring-offset-1 ring-ink scale-110" : ""}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => removeSelectOption(categoryIndex, optionIndex)}
          className="text-ink-muted hover:text-error shrink-0 transition-colors duration-150"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  function StatusOptionItem({
    categoryIndex,
    optionIndex,
    option,
  }: {
    categoryIndex: number;
    optionIndex: number;
    option: StatusCategoryConfig["options"][number];
  }) {
    const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: option.name });
    const style: React.CSSProperties = {
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition,
      opacity: isDragging ? 0.4 : undefined,
      zIndex: isDragging ? 10 : undefined,
    };

    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2 px-3 py-1.5 border-t border-stroke bg-elevated">
        <button type="button" className="cursor-grab text-ink-muted shrink-0" {...listeners}>
          <GripVertical size={14} />
        </button>
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: option.color }} />
        <button
          type="button"
          onClick={(e) => setIconPickerState({ element: e.currentTarget, categoryIndex, optionIndex, propType: "status" })}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface shrink-0 transition-colors duration-150"
        >
          {option.icon ? <IconDisplay value={option.icon} size={12} /> : <ImageIcon size={11} className="text-ink-muted" />}
        </button>
        <input
          type="text"
          value={option.name}
          onChange={(e) => updateStatusOptionName(categoryIndex, optionIndex, e.target.value)}
          placeholder="Option…"
          className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-ink-muted"
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
          className="text-ink-muted hover:text-error shrink-0 transition-colors duration-150"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function addStatusOption(categoryIndex: number) {
    onPatch({
      categories: statusCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
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
      categories: statusCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? { ...category, options: category.options.filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex) }
          : category,
      ),
    });
  }

  function updateStatusOptionName(categoryIndex: number, optionIndex: number, optName: string) {
    onPatch({
      categories: statusCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              options: category.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, name: optName } : option,
              ),
            }
          : category,
      ),
    });
  }

  function updateStatusOptionColor(categoryIndex: number, optionIndex: number, color: StatusOptionColor) {
    onPatch({
      categories: statusCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              options: category.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, color } : option,
              ),
            }
          : category,
      ),
    });
  }

  function updateStatusOptionIcon(categoryIndex: number, optionIndex: number, icon: string) {
    onPatch({
      categories: statusCategories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              options: category.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? { ...option, icon } : option,
              ),
            }
          : category,
      ),
    });
  }

  switch (type) {
    case PropertyType.TEXT:
      return null;

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
          {(config.format === "float" || config.format === "currency" || config.format === "percentage") && (
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="type-field-label mb-1">Prefix</p>
              <input
                type="text"
                maxLength={10}
                value={String(config.prefix ?? "")}
                onChange={(e) => onPatch({ prefix: e.target.value })}
                className="field-input w-full"
                placeholder="e.g. ≈"
              />
            </div>
            <div>
              <p className="type-field-label mb-1">Suffix</p>
              <input
                type="text"
                maxLength={10}
                value={String(config.suffix ?? "")}
                onChange={(e) => onPatch({ suffix: e.target.value })}
                className="field-input w-full"
                placeholder="e.g. kg"
              />
            </div>
          </div>
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

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSelectDragEnd}>
            <div className="flex flex-col gap-2">
              <p className="type-field-label">Categories &amp; options</p>
              <SortableContext items={selectCategories.map((category) => category.label)} strategy={verticalListSortingStrategy}>
                {selectCategories.map((category, categoryIndex) => (
                  <CategoryItem key={category.label} category={category} categoryIndex={categoryIndex} />
                ))}
              </SortableContext>
              <button
                type="button"
                onClick={addSelectCategory}
                className="self-start flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors duration-150"
              >
                <Plus size={12} /> Add category
              </button>
            </div>
          </DndContext>
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

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {statusCategories.map((category, categoryIndex) => (
              <div key={category.category}>
                <input
                  type="text"
                  value={category.label ?? ""}
                  onChange={(e) => updateStatusCategoryLabel(categoryIndex, e.target.value)}
                  placeholder={`${category.category.charAt(0).toUpperCase() + category.category.slice(1)} label…`}
                  className="text-tiny font-semibold uppercase tracking-widest text-ink mb-2 w-full bg-transparent outline-none placeholder:text-ink-muted"
                />
                <div className="flex items-center gap-2 mb-2 text-xs text-ink-muted">
                  <span>Default:</span>
                  <select
                    value={category.defaultOption ?? ""}
                    onChange={(e) => updateStatusCategoryDefaultOption(categoryIndex, e.target.value)}
                    className="bg-surface rounded px-1 py-0.5"
                  >
                    {category.options.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-lg border border-stroke overflow-hidden">
                  <SortableContext items={category.options.map((option) => option.name)} strategy={verticalListSortingStrategy}>
                    {category.options.map((option, optionIndex) => (
                      <StatusOptionItem key={option.name} categoryIndex={categoryIndex} optionIndex={optionIndex} option={option} />
                    ))}
                  </SortableContext>
                  <button
                    type="button"
                    onClick={() => addStatusOption(categoryIndex)}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors duration-150"
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
          </DndContext>
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

    case PropertyType.DURATION:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">Format</p>
            <select
              value={String(config.format ?? "HH:mm")}
              onChange={(e) => onPatch({ format: e.target.value })}
              className="field-input w-full"
            >
              {DURATION_FORMAT_VALUES.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="type-field-label mb-1">Default value (seconds)</p>
            <input
              type="number"
              min={0}
              value={Number(config.defaultValue ?? 0)}
              onChange={(e) => onPatch({ defaultValue: Number(e.target.value) })}
              className="field-input w-full"
            />
          </div>
        </div>
      );

    case PropertyType.FORMULA:
      return <FormulaConfig config={config as unknown as FormulaPropertyConfig} properties={properties} onPatch={onPatch} />;

    default:
      return null;
  }
}
