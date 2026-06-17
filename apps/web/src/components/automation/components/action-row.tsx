"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { AutomationActionType, PropertyType } from "@fixspace/domain";
import type { PropertyResponseDto, DatabaseResponseDto } from "@fixspace/domain";
import { PropertyIcon } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/ui/property-icon";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { NumberInput } from "@/components/ui/primitives/inputs/number-input";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { DateActionInput } from "./date-action-input";
import { RelationValueInput } from "./relation-value-input";

interface ActionDraft {
  type: AutomationActionType;
  propertyId: string;
  value: string;
  databaseId: string;
}

interface ActionRowProps {
  action: ActionDraft;
  index: number;
  onUpdateAction: (index: number, patch: Partial<ActionDraft>) => void;
  onDeleteAction: (index: number) => void;
  isDeleteDisabled: boolean;
  actionLabels: Record<string, string>;
  writableOptions: ComboboxOption[];
  writableProps: PropertyResponseDto[];
  relationProps: PropertyResponseDto[];
  otherDatabases: DatabaseResponseDto[];
}

function toOption(property: PropertyResponseDto): ComboboxOption {
  return { value: property.id, label: property.name, iconElement: <PropertyIcon type={property.type} size={14} /> };
}

function getSelectOptions(property: PropertyResponseDto): ComboboxOption[] {
  if (property.type !== PropertyType.SELECT && property.type !== PropertyType.STATUS) return [];
  const config = property.config as Record<string, unknown> | undefined;
  if (!config?.categories) return [];
  return (config.categories as Array<Record<string, unknown>>).flatMap((category) =>
    (category.options as Array<Record<string, string>>).map((option) => ({
      value: option.value ?? option.name ?? "",
      label: option.value ?? option.name ?? "",
      icon: option.icon ?? undefined,
      color: option.color ?? undefined,
    })),
  );
}

export function ActionRow({
  action,
  index,
  onUpdateAction,
  onDeleteAction,
  isDeleteDisabled,
  actionLabels,
  writableOptions,
  writableProps,
  relationProps,
  otherDatabases,
}: ActionRowProps) {
  const t = useTranslations("Automation");

  return (
    <div className="flex flex-col gap-2 p-2 border border-stroke rounded-lg bg-surface">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Combobox
            value={action.type}
            onChange={(value) => onUpdateAction(index, { type: value as AutomationActionType, propertyId: "", databaseId: "" })}
            options={Object.values(AutomationActionType).map((value) => ({ value, label: actionLabels[value] || value }))}
          />
        </div>
        {!isDeleteDisabled && (
          <button
            type="button"
            onClick={() => onDeleteAction(index)}
            className="text-ink-secondary hover:text-error shrink-0 transition-colors duration-150"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {action.type === AutomationActionType.SET_FIELD_VALUE && (
        <div className="grid grid-cols-2 gap-2">
          <Combobox
            value={action.propertyId}
            onChange={(value) => onUpdateAction(index, { propertyId: value, value: "" })}
            options={writableOptions}
            placeholder={t("propertyPlaceholder")}
            nullable
          />
          {(() => {
            const selectedProp = writableProps.find((property) => property.id === action.propertyId);
            if (!selectedProp) {
              return (
                <TextInput value={action.value} onChange={(value) => onUpdateAction(index, { value })} placeholder={t("thenSection")} />
              );
            }
            switch (selectedProp.type) {
              case PropertyType.SELECT:
              case PropertyType.STATUS: {
                const options = getSelectOptions(selectedProp);
                return (
                  <Combobox
                    value={action.value}
                    onChange={(value) => onUpdateAction(index, { value })}
                    options={options}
                    placeholder={t("thenSection")}
                    nullable
                  />
                );
              }
              case PropertyType.NUMBER:
                return (
                  <NumberInput
                    value={action.value ? Number(action.value) : null}
                    onChange={(value) => onUpdateAction(index, { value: String(value ?? "") })}
                    placeholder={t("thenSection")}
                  />
                );
              case PropertyType.CHECKBOX:
                return (
                  <div className="flex items-center py-1">
                    <Toggle value={action.value === "true"} onChange={(value) => onUpdateAction(index, { value: String(value) })} />
                  </div>
                );
              case PropertyType.DATE:
                return <DateActionInput value={action.value} onChange={(value) => onUpdateAction(index, { value })} />;
              case PropertyType.RATING: {
                const maxStars = ((selectedProp.config as Record<string, unknown>)?.maxStars as number) ?? 5;
                return (
                  <NumberInput
                    value={action.value ? Number(action.value) : null}
                    onChange={(value) => onUpdateAction(index, { value: String(value ?? "") })}
                    min={1}
                    max={maxStars}
                    placeholder={t("thenSection")}
                  />
                );
              }
              case PropertyType.PROGRESS: {
                const config = selectedProp.config as Record<string, unknown> | undefined;
                const minVal = (config?.minValue as number) ?? 0;
                const maxVal = (config?.maxValue as number) ?? 100;
                return (
                  <NumberInput
                    value={action.value ? Number(action.value) : null}
                    onChange={(value) => onUpdateAction(index, { value: String(value ?? "") })}
                    min={minVal}
                    max={maxVal}
                    placeholder={t("thenSection")}
                  />
                );
              }
              case PropertyType.RELATION: {
                const config = selectedProp.config as Record<string, unknown> | undefined;
                const relatedDbId = config?.relatedEntityId as string | undefined;
                return (
                  <RelationValueInput
                    relatedDbId={relatedDbId}
                    value={action.value}
                    onChange={(value) => onUpdateAction(index, { value })}
                  />
                );
              }
              default:
                return (
                  <TextInput value={action.value} onChange={(value) => onUpdateAction(index, { value })} placeholder={t("thenSection")} />
                );
            }
          })()}
        </div>
      )}

      {action.type === AutomationActionType.CREATE_RECORD && (
        <Combobox
          value={action.databaseId}
          onChange={(value) => onUpdateAction(index, { databaseId: value })}
          options={otherDatabases.map((database) => ({ value: database.id, label: database.name, icon: database.icon }))}
          placeholder={t("databasePlaceholder")}
          nullable
        />
      )}

      {action.type === AutomationActionType.LINK_RECORDS && (
        <div className="flex flex-col gap-2">
          <Combobox
            value={action.propertyId}
            onChange={(value) => onUpdateAction(index, { propertyId: value })}
            options={relationProps.map(toOption)}
            placeholder={relationProps.length ? t("propertyPlaceholder") : t("noRelationFields")}
            nullable
          />
          <Combobox
            value={action.databaseId}
            onChange={(value) => onUpdateAction(index, { databaseId: value })}
            options={otherDatabases.map((database) => ({ value: database.id, label: database.name, icon: database.icon }))}
            placeholder={t("databasePlaceholder")}
            nullable
          />
        </div>
      )}
    </div>
  );
}
