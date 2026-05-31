"use client";

import { CellValue } from "@/features/database/components/cell-value";
import { PropertyHint } from "@/features/property/components/property-hint";
import { PropertyIcon } from "@/features/property/components/property-icon";
import { PropertyInput } from "@/features/property/components/property-input";
import { Card } from "@/components/ui/primitives/display/card";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";

type RecordPropertiesSectionProps = {
  isEditMode: boolean;
  propsOpen: boolean;
  groupOrder: string[];
  grouped: Record<string, PropertyResponseDto[]>;
  formValues: Record<string, unknown>;
  record: RecordResponseDto;
  relatedRecordsMap: Record<string, RecordResponseDto[]>;
  onPropsToggle?: () => void;
  onValueChange: (propId: string, val: unknown) => void;
};

export function RecordPropertiesSection({
  isEditMode,
  propsOpen,
  groupOrder,
  grouped,
  formValues,
  record,
  relatedRecordsMap,
  onValueChange,
}: RecordPropertiesSectionProps) {
  return (
    <div>
      {propsOpen && (
        <div className="flex flex-col gap-4">
          {groupOrder.map((groupName) => (
            <div key={groupName} className="flex flex-col gap-3">
              {groupName && (
                <h3 className="text-tiny font-semibold uppercase tracking-widest text-ink-muted select-none">
                  {groupName}
                </h3>
              )}
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {grouped[groupName]!.map((prop) => {
                  const pv = record.values?.find((v) => v.propertyId === prop.id);
                  const relatedDbId =
                    prop.type === PropertyType.RELATION
                      ? (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId
                      : undefined;
                  const statusColor =
                    prop.type === PropertyType.STATUS && typeof pv?.value === "object" && pv?.value !== null
                      ? ((pv.value as Record<string, unknown>).color as string | undefined)
                      : undefined;

                  return (
                    <Card
                      key={prop.id}
                      variant="elevated"
                      className={`flex flex-col gap-2 p-3! transition-colors duration-150 ${isEditMode ? "" : "hover:bg-hover"}`}
                      style={statusColor ? { borderLeft: `2px solid ${statusColor}` } : undefined}
                    >
                      <div className="flex items-center gap-1.5 text-tiny font-semibold uppercase tracking-widest text-ink-secondary">
                        <PropertyIcon type={prop.type} size={10} />
                        <span className="truncate">{prop.name}</span>
                        {prop.hint && <PropertyHint hint={prop.hint} />}
                      </div>

                      {isEditMode ? (
                        <PropertyInput
                          property={prop}
                          value={formValues[prop.id]}
                          onChange={(val) => onValueChange(prop.id, val)}
                          relationRecordsMap={relatedRecordsMap}
                        />
                      ) : (
                        <div className="text-sm text-ink">
                          <CellValue
                            value={pv?.value}
                            type={prop.type}
                            relatedRecords={relatedDbId ? relatedRecordsMap[relatedDbId] : undefined}
                          />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
