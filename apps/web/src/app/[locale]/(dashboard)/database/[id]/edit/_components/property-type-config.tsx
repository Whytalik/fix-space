"use client";

import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { NumberInput } from "@/components/ui/primitives/inputs/number-input";

import { IconPicker } from "@/components/ui/icons/icon-picker";
import type {
  DatabaseResponseDto,
  PropertyResponseDto,
  SelectCategory,
  SelectOption,
  StatusCategoryConfig,
  StatusOptionColor,
  FormulaPropertyConfig,
  ProgressPropertyConfig,
  RelationPropertyConfig,
} from "@fixspace/domain";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  DATA_FORMATS_VALUES,
  DEFAULT_STATUS_PROPERTY,
  DURATION_FORMAT_VALUES,
  NUMBER_FORMAT_VALUES,
  PropertyType,
  STATUS_OPTION_COLOR_VALUES,
  TIME_FORMATS_VALUES,
} from "@fixspace/domain";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
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

import { CategoryItem } from "./select-option-item";
import { StatusOptionItem } from "./status-option-item";

export function PropertyTypeConfig({ type, config, properties, databases, onPatch }: PropertyTypeConfigProps) {
  const t = useTranslations("PropertyConfig");
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
            <p className="type-field-label mb-1">{t("format")}</p>
            <Combobox
              options={NUMBER_FORMAT_VALUES.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
              value={String(config.format ?? "float")}
              onChange={(value) => onPatch({ format: value })}
            />
          </div>
          {(config.format === "float" || config.format === "currency" || config.format === "percentage") && (
            <div>
              <p className="type-field-label mb-1">{t("decimalPlaces")}</p>
              <NumberInput
                value={Number(config.decimalPlaces ?? 2)}
                onChange={(v) => onPatch({ decimalPlaces: v ?? 0 })}
                min={0}
                max={10}
              />
            </div>
          )}
          {config.format === "currency" && (
            <div>
              <p className="type-field-label mb-1">{t("currencySymbol")}</p>
              <TextInput value={String(config.currencySymbol ?? "$")} onChange={(v) => onPatch({ currencySymbol: v })} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="type-field-label mb-1">{t("prefix")}</p>
              <TextInput
                value={String(config.prefix ?? "")}
                onChange={(v) => onPatch({ prefix: v })}
                placeholder={t("prefixPlaceholder")}
              />
            </div>
            <div>
              <p className="type-field-label mb-1">{t("suffix")}</p>
              <TextInput
                value={String(config.suffix ?? "")}
                onChange={(v) => onPatch({ suffix: v })}
                placeholder={t("suffixPlaceholder")}
              />
            </div>
          </div>
          <div>
            <p className="type-field-label mb-1">{t("defaultValue")}</p>
            <NumberInput value={Number(config.defaultValue ?? 0)} onChange={(v) => onPatch({ defaultValue: v ?? 0 })} />
          </div>
        </div>
      );

    case PropertyType.DATE:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">{t("dateFormat")}</p>
            <Combobox
              options={DATA_FORMATS_VALUES.map((f) => ({ value: f, label: f }))}
              value={String(config.format ?? DATA_FORMATS_VALUES[0])}
              onChange={(value) => onPatch({ format: value })}
            />
          </div>
          <label className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink">{t("includeTime")}</p>
            <Toggle value={Boolean(config.includeTime)} onChange={(value) => onPatch({ includeTime: value })} />
          </label>
          {Boolean(config.includeTime) && (
            <div>
              <p className="type-field-label mb-1">{t("timeFormat")}</p>
              <Combobox
                options={TIME_FORMATS_VALUES.map((f) => ({ value: f, label: f }))}
                value={String(config.timeFormat ?? TIME_FORMATS_VALUES[0])}
                onChange={(value) => onPatch({ timeFormat: value })}
              />
            </div>
          )}
        </div>
      );

    case PropertyType.CHECKBOX:
      return (
        <label className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink">{t("defaultChecked")}</p>
          <Toggle value={Boolean(config.defaultValue)} onChange={(value) => onPatch({ defaultValue: value })} />
        </label>
      );

    case PropertyType.SELECT:
      return (
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink">{t("multiSelect")}</p>
              <p className="text-xs text-ink-muted mt-0.5">{t("multiSelectDesc")}</p>
            </div>
            <Toggle value={Boolean(config.isMultiSelect)} onChange={(value) => onPatch({ isMultiSelect: value })} />
          </label>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSelectDragEnd}>
            <div className="flex flex-col gap-2">
              <p className="type-field-label">{t("categoriesOptions")}</p>
              <SortableContext items={selectCategories.map((category) => category.label)} strategy={verticalListSortingStrategy}>
                {selectCategories.map((category, categoryIndex) => (
                  <CategoryItem
                    key={categoryIndex}
                    category={category}
                    categoryIndex={categoryIndex}
                    onUpdateLabel={(label) => updateSelectCategoryLabel(categoryIndex, label)}
                    onRemove={() => removeSelectCategory(categoryIndex)}
                    onAddOption={() => addSelectOption(categoryIndex)}
                    onUpdateOption={(optionIndex, value) => updateSelectOption(categoryIndex, optionIndex, value)}
                    onRemoveOption={(optionIndex) => removeSelectOption(categoryIndex, optionIndex)}
                    onUpdateOptionColor={(optionIndex, color) => updateSelectOptionColor(categoryIndex, optionIndex, color)}
                    onOpenIconPicker={(element, optionIndex) =>
                      setIconPickerState({ element, categoryIndex, optionIndex, propType: "select" })
                    }
                  />
                ))}
              </SortableContext>
              <button
                type="button"
                onClick={addSelectCategory}
                className="self-start flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors duration-150"
              >
                <Plus size={12} /> {t("addCategory")}
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
            <p className="type-field-label mb-1">{t("defaultOption")}</p>
            <Combobox
              options={allStatusOptions.map((name) => ({ value: name, label: name }))}
              value={String(config.defaultOption ?? "")}
              onChange={(value) => onPatch({ defaultOption: value })}
              nullable
            />
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {statusCategories.map((category, categoryIndex) => (
              <div key={category.category}>
                <TextInput
                  size="sm"
                  value={category.label ?? ""}
                  onChange={(v) => updateStatusCategoryLabel(categoryIndex, v)}
                  placeholder={t("categoryPlaceholder", { category: t(`statusCategories.${category.category}`) })}
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-ink-muted shrink-0">{t("defaultLabel")}</span>
                  <Combobox
                    options={category.options.map((option) => ({ value: option.name, label: option.name }))}
                    value={category.defaultOption ?? ""}
                    onChange={(value) => updateStatusCategoryDefaultOption(categoryIndex, value)}
                    nullable
                  />
                </div>
                <div className="rounded-lg border border-stroke overflow-hidden">
                  <SortableContext items={category.options.map((option) => option.name)} strategy={verticalListSortingStrategy}>
                    {category.options.map((option, optionIndex) => (
                      <StatusOptionItem
                        key={optionIndex}
                        option={option}
                        onUpdateName={(name) => updateStatusOptionName(categoryIndex, optionIndex, name)}
                        onRemove={() => removeStatusOption(categoryIndex, optionIndex)}
                        onUpdateColor={(color) => updateStatusOptionColor(categoryIndex, optionIndex, color)}
                        onOpenIconPicker={(element) => setIconPickerState({ element, categoryIndex, optionIndex, propType: "status" })}
                      />
                    ))}
                  </SortableContext>
                  <button
                    type="button"
                    onClick={() => addStatusOption(categoryIndex)}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-muted hover:text-ink hover:bg-surface/50 transition-colors duration-150"
                  >
                    <Plus size={11} /> {t("addOption")}
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
            <p className="type-field-label mb-1">{t("relatedDatabase")}</p>
            <div className="mt-1">
              <Combobox
                options={databases.map((database) => ({ value: database.id, label: database.name, icon: database.icon }))}
                value={String(config.relatedEntityId ?? "")}
                onChange={(value) => onPatch({ relatedEntityId: value || undefined })}
                placeholder={t("selectDatabase")}
                nullable
              />
            </div>
          </div>
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink">{t("multipleValues")}</p>
              <p className="text-xs text-ink-muted mt-0.5">{t("multipleValuesDesc")}</p>
            </div>
            <Toggle value={Boolean(config.multiple ?? true)} onChange={(value) => onPatch({ multiple: value })} />
          </label>
        </div>
      );

    case PropertyType.DURATION:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">{t("format")}</p>
            <Combobox
              options={DURATION_FORMAT_VALUES.map((f) => ({ value: f, label: f }))}
              value={String(config.format ?? "HH:mm")}
              onChange={(value) => onPatch({ format: value })}
            />
          </div>
          <div>
            <p className="type-field-label mb-1">{t("defaultValueSeconds")}</p>
            <NumberInput value={Number(config.defaultValue ?? 0)} onChange={(v) => onPatch({ defaultValue: v ?? 0 })} min={0} />
          </div>
        </div>
      );

    case PropertyType.PROGRESS: {
      const progressConfig = config as unknown as ProgressPropertyConfig;
      const relationProperties = properties.filter((p) => p.type === PropertyType.RELATION);
      const selectedRelationId = progressConfig.relationPropertyId || "";
      const selectedRelation = relationProperties.find((p) => p.id === selectedRelationId);
      const relatedDbId = (selectedRelation?.config as RelationPropertyConfig)?.relatedEntityId;
      interface DatabaseWithProperties extends DatabaseResponseDto {
        properties?: PropertyResponseDto[];
      }
      const relatedDb = databases.find((db) => db.id === relatedDbId) as DatabaseWithProperties | undefined;
      const targetProperties: PropertyResponseDto[] = relatedDb?.properties ?? [];

      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">{t("mode")}</p>
            <Combobox
              options={[
                { value: "custom", label: t("modeCustom") },
                { value: "source", label: t("modeSource") },
              ]}
              value={progressConfig.mode || "custom"}
              onChange={(mode) => {
                onPatch({
                  mode,
                  relationPropertyId: mode === "source" ? relationProperties[0]?.id : undefined,
                  targetPropertyId: undefined,
                  rollupType: mode === "source" ? "percent_complete" : undefined,
                });
              }}
            />
          </div>

          {progressConfig.mode === "source" ? (
            <>
              <div>
                <p className="type-field-label mb-1">{t("relationProperty")}</p>
                <Combobox
                  options={[{ value: "", label: t("selectRelation") }, ...relationProperties.map((p) => ({ value: p.id, label: p.name }))]}
                  value={selectedRelationId}
                  onChange={(relId) => {
                    const relatedProperty = relationProperties.find((p) => p.id === relId);
                    const rDbId = (relatedProperty?.config as RelationPropertyConfig)?.relatedEntityId;
                    const relatedDatabase = databases.find((db) => db.id === rDbId) as DatabaseWithProperties | undefined;
                    onPatch({
                      relationPropertyId: relId || undefined,
                      targetPropertyId: relatedDatabase?.properties?.[0]?.id || undefined,
                    });
                  }}
                  nullable
                />
              </div>

              <div>
                <p className="type-field-label mb-1">{t("targetProperty")}</p>
                <Combobox
                  options={[
                    { value: "", label: t("selectProperty") },
                    ...targetProperties.map((p) => ({ value: p.id, label: `${p.name} (${p.type})` })),
                  ]}
                  value={progressConfig.targetPropertyId || ""}
                  onChange={(value) => onPatch({ targetPropertyId: value || undefined })}
                  disabled={!selectedRelationId}
                  nullable
                />
              </div>

              <div>
                <p className="type-field-label mb-1">{t("rollupType")}</p>
                <Combobox
                  options={[
                    { value: "percent_complete", label: t("percentComplete") },
                    { value: "percent_checked", label: t("percentChecked") },
                    { value: "average", label: t("average") },
                    { value: "sum", label: t("sum") },
                    { value: "count", label: t("count") },
                  ]}
                  value={progressConfig.rollupType || "percent_complete"}
                  onChange={(value) => onPatch({ rollupType: value })}
                  disabled={!progressConfig.targetPropertyId}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="type-field-label mb-1">{t("minValue")}</p>
                  <NumberInput value={progressConfig.minValue ?? 0} onChange={(v) => onPatch({ minValue: v ?? 0 })} />
                </div>
                <div>
                  <p className="type-field-label mb-1">{t("maxValue")}</p>
                  <NumberInput value={progressConfig.maxValue ?? 100} onChange={(v) => onPatch({ maxValue: v ?? 100 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="type-field-label mb-1">{t("step")}</p>
                  <NumberInput value={progressConfig.step ?? 1} onChange={(v) => onPatch({ step: v ?? 1 })} min={0.000001} />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <CheckboxInput
                    checked={Boolean(progressConfig.showLabel ?? true)}
                    onChange={(checked) => onPatch({ showLabel: checked })}
                  />
                  <span className="text-sm text-ink-secondary">{t("showLabel")}</span>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    case PropertyType.RATING:
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="type-field-label mb-1">{t("maxStars")}</p>
            <NumberInput value={Number(config.maxStars ?? 5)} onChange={(v) => onPatch({ maxStars: v ?? 5 })} min={1} max={10} />
          </div>
          <label className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink">{t("allowHalf")}</p>
            <Toggle value={Boolean(config.allowHalf ?? true)} onChange={(v) => onPatch({ allowHalf: v })} />
          </label>
        </div>
      );

    case PropertyType.FORMULA:
      return <FormulaConfig config={config as unknown as FormulaPropertyConfig} properties={properties} onPatch={onPatch} />;

    default:
      return null;
  }
}
