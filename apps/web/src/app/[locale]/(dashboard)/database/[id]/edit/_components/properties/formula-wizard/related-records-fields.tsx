"use client";

import { useQuery } from "@tanstack/react-query";
import type { FormulaPropertyConfig, PropertyResponseDto } from "@fixspace/domain";
import { FormulaPresetName, compileFormula } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { getProperties } from "@/lib/api/property";

interface RelatedRecordsFieldsProps {
  config: FormulaPropertyConfig;
  properties: PropertyResponseDto[];
  onPatch: (patch: Partial<FormulaPropertyConfig>) => void;
  t: (key: string) => string;
}

export function RelatedRecordsFields({ config, properties, onPatch, t }: RelatedRecordsFieldsProps) {
  const uiState = (config.uiState ?? {}) as Record<string, unknown>;
  const relationProps = properties.filter((property) => property.type === PropertyType.RELATION);

  const selectedRelProp = properties.find((property) => property.id === uiState.relation);
  const relConfig = selectedRelProp?.config as { relatedEntityId?: string } | undefined;
  const relatedDbId = relConfig?.relatedEntityId ?? "";

  const { data: relatedProps = [] } = useQuery({
    queryKey: ["properties", relatedDbId],
    queryFn: () => getProperties(relatedDbId),
    enabled: !!relatedDbId,
  });

  const operation = (uiState.operation as string) ?? "COUNT";
  const needsField = operation !== "COUNT";

  const filteredRelatedProps = relatedProps.filter((property) => {
    if (property.type === PropertyType.FORMULA) return false;
    if (operation === "SUM" || operation === "AVG" || operation === "MIN" || operation === "MAX") {
      return property.type === PropertyType.NUMBER;
    }
    if (operation === "EARLIEST" || operation === "LATEST") {
      return property.type === PropertyType.DATE;
    }
    return true;
  });

  function patch(key: string, value: unknown) {
    const newUiState = { ...uiState, [key]: value };
    const compiled = compileFormula(FormulaPresetName.RELATED_RECORDS, newUiState);
    onPatch({
      uiState: newUiState,
      expression: compiled.expression,
      resultType: compiled.resultType as FormulaPropertyConfig["resultType"],
    });
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.relationField")}</label>
        <Combobox
          options={relationProps.map((property) => ({ label: property.name, value: property.id }))}
          value={(uiState.relation as string) ?? ""}
          onChange={(value) => patch("relation", value)}
          placeholder={t("wizard.fieldPickerPlaceholder")}
        />
      </div>

      {relatedDbId && (
        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("wizard.operation")}</label>
          <Combobox
            value={operation}
            onChange={(value) => patch("operation", value)}
            options={[
              { value: "COUNT", label: t("wizard.count") },
              { value: "SUM", label: t("wizard.sum") },
              { value: "AVG", label: t("wizard.avg") },
              { value: "MIN", label: t("wizard.min") },
              { value: "MAX", label: t("wizard.max") },
              { value: "EARLIEST", label: t("wizard.earliest") },
              { value: "LATEST", label: t("wizard.latest") },
              { value: "LIST", label: t("wizard.list") },
            ]}
          />
        </div>
      )}

      {needsField && relatedDbId && (
        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("wizard.relatedField")}</label>
          <Combobox
            options={filteredRelatedProps.map((property) => ({ label: property.name, value: property.id }))}
            value={(uiState.field as string) ?? ""}
            onChange={(value) => patch("field", value)}
            placeholder={t("wizard.fieldPickerPlaceholder")}
          />
        </div>
      )}
    </>
  );
}
