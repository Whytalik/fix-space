"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { FormulaPropertyConfig, PropertyResponseDto } from "@fixspace/domain";
import { FormulaPresetName, compileFormula } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { Plus, Trash2 } from "lucide-react";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { Select } from "@/components/ui/primitives/inputs/select";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { getProperties } from "@/lib/api/property";
import { PRESET_META } from "./formula-presets.meta";

type FormulaWizardProps = {
  config: FormulaPropertyConfig;
  properties: PropertyResponseDto[];
  onPatch: (patch: Partial<FormulaPropertyConfig>) => void;
};

export function FormulaWizard({ config, properties, onPatch }: FormulaWizardProps) {
  const t = useTranslations("Formula");
  const nonFormulaProps = properties.filter((p) => p.type !== PropertyType.FORMULA);
  const uiState = (config.uiState ?? {}) as Record<string, unknown>;

  function patchUiState(key: string, value: unknown) {
    recompile({ ...uiState, [key]: value });
  }

  function recompile(newUiState: Record<string, unknown>) {
    if (!config.presetName) return;
    const compiled = compileFormula(config.presetName, newUiState);
    onPatch({
      uiState: newUiState,
      expression: compiled.expression,
      resultType: compiled.resultType as FormulaPropertyConfig["resultType"],
    });
  }

  const numberProps = nonFormulaProps.filter((p) => p.type === PropertyType.NUMBER);
  const numberAndRatingProps = nonFormulaProps.filter((p) => p.type === PropertyType.NUMBER || p.type === PropertyType.RATING);
  const checkboxProps = nonFormulaProps.filter((p) => p.type === PropertyType.CHECKBOX);
  const dateProps = nonFormulaProps.filter((p) => p.type === PropertyType.DATE);

  const presetMeta = config.presetName ? PRESET_META[config.presetName] : undefined;

  const renderFields = () => {
    switch (config.presetName) {
      case FormulaPresetName.R_MULTIPLE:
        return (
          <>
            <FieldPicker
              label={t("wizard.rMultiplePnL")}
              paramKey="pnl"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.rMultipleRisk")}
              paramKey="risk"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
          </>
        );

      case FormulaPresetName.PLANNED_RR:
        return (
          <>
            <FieldPicker
              label={t("wizard.plannedRrEntry")}
              paramKey="entry"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.plannedRrTarget")}
              paramKey="target"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.plannedRrStop")}
              paramKey="stop"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <div className="flex items-center justify-between py-1">
              <label className="type-form-label">{t("wizard.shortPosition")}</label>
              <Toggle value={!!uiState.isShort} onChange={(v) => patchUiState("isShort", v)} />
            </div>
          </>
        );

      case FormulaPresetName.RISK_PCT_BALANCE:
        return (
          <>
            <FieldPicker
              label={t("wizard.riskPctBalanceRisk")}
              paramKey="risk"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.riskPctBalanceBalance")}
              paramKey="balance"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
          </>
        );

      case FormulaPresetName.PERCENTAGE:
        return (
          <>
            <FieldPicker
              label={t("wizard.percentageNumerator")}
              paramKey="numerator"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.percentageDenominator")}
              paramKey="denominator"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
          </>
        );

      case FormulaPresetName.AVG_SCORE:
        return (
          <div className="flex flex-col gap-1.5">
            <label className="type-form-label">{t("wizard.fieldsLabel")}</label>
            <Combobox
              multiple
              options={numberAndRatingProps.map((p) => ({ label: p.name, value: p.id }))}
              value={((uiState.fields as string[]) ?? []).slice(0, 5)}
              onChange={(vals) => patchUiState("fields", (vals as string[]).slice(0, 5))}
              placeholder={t("wizard.selectFields")}
            />
          </div>
        );

      case FormulaPresetName.RULE_COMPLIANCE:
        return (
          <div className="flex flex-col gap-1.5">
            <label className="type-form-label">{t("wizard.rulesLabel")}</label>
            <Combobox
              multiple
              options={checkboxProps.map((p) => ({ label: p.name, value: p.id }))}
              value={(uiState.fields as string[]) ?? []}
              onChange={(vals) => patchUiState("fields", vals)}
              placeholder={t("wizard.selectCheckboxes")}
            />
          </div>
        );

      case FormulaPresetName.CONDITIONAL_TEXT:
        return <ConditionalTextFields t={t} uiState={uiState} properties={nonFormulaProps} onPatch={patchUiState} />;

      case FormulaPresetName.CATEGORY_THRESHOLD:
        return <CategoryThresholdFields t={t} uiState={uiState} numberProps={numberProps} onRecompile={recompile} />;

      case FormulaPresetName.DATE_DIFF:
        return (
          <>
            <FieldPicker
              label={t("wizard.dateDiffDate1")}
              paramKey="date1"
              t={t}
              options={dateProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.dateDiffDate2")}
              paramKey="date2"
              t={t}
              options={dateProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <div className="flex flex-col gap-1.5">
              <label className="type-form-label">{t("wizard.format")}</label>
              <Select
                value={(uiState.format as string) ?? "days"}
                onChange={(e) => patchUiState("format", e.target.value)}
                options={[
                  { value: "days", label: t("wizard.days") },
                  { value: "hours", label: t("wizard.hours") },
                  { value: "weeks", label: t("wizard.weeks") },
                ]}
              />
            </div>
          </>
        );

      case FormulaPresetName.RELATED_RECORDS:
        return <RelatedRecordsFields t={t} config={config} properties={nonFormulaProps} onPatch={onPatch} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-surface rounded-2xl border border-stroke">
      {presetMeta && (
        <div>
          <p className="type-modal-title">{t(presetMeta.nameKey)}</p>
          <p className="type-hint mt-0.5">{t(presetMeta.descriptionKey)}</p>
        </div>
      )}
      <div className="flex flex-col gap-4">{renderFields()}</div>
      {config.expression && (
        <div className="pt-3 border-t border-stroke">
          <p className="type-hint uppercase tracking-widest mb-1.5">{t("wizard.expression")}</p>
          <div className="px-3 py-2 bg-canvas rounded-lg border border-stroke">
            <p className="font-mono text-xs text-ink-secondary truncate">{config.expression}</p>
          </div>
        </div>
      )}
    </div>
  );
}

type FieldPickerProps = {
  label: string;
  paramKey: string;
  options: PropertyResponseDto[];
  uiState: Record<string, unknown>;
  onPatch: (key: string, value: unknown) => void;
  t: (key: string) => string;
};

function FieldPicker({ label, paramKey, options, uiState, onPatch, t }: FieldPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="type-form-label">{label}</label>
      <Combobox
        options={options.map((p) => ({ label: p.name, value: p.id }))}
        value={(uiState[paramKey] as string) ?? ""}
        onChange={(val) => onPatch(paramKey, val)}
        placeholder={t("wizard.fieldPickerPlaceholder")}
      />
    </div>
  );
}

type ConditionalTextFieldsProps = {
  uiState: Record<string, unknown>;
  properties: PropertyResponseDto[];
  onPatch: (key: string, value: unknown) => void;
  t: (key: string) => string;
};

function ConditionalTextFields({ t, uiState, properties, onPatch }: ConditionalTextFieldsProps) {
  return (
    <>
      <FieldPicker
        label={t("wizard.conditionalTextField")}
        paramKey="field"
        t={t}
        options={properties}
        uiState={uiState}
        onPatch={onPatch}
      />
      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.conditionLabel")}</label>
        <Select
          value={(uiState.operator as string) ?? "=="}
          onChange={(e) => onPatch("operator", e.target.value)}
          options={[
            { value: "==", label: t("customBuilder.equals") },
            { value: "!=", label: t("customBuilder.notEquals") },
            { value: ">", label: t("customBuilder.greaterThan") },
            { value: "<", label: t("customBuilder.lessThan") },
            { value: ">=", label: t("customBuilder.greaterThanEquals") },
            { value: "<=", label: t("customBuilder.lessThanEquals") },
          ]}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.valueLabel")}</label>
        <input
          type="text"
          className="field-input w-full"
          value={(uiState.value as string) ?? ""}
          onChange={(e) => onPatch("value", e.target.value)}
          placeholder={t("customBuilder.valuePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("wizard.thenLabel")}</label>
          <input
            type="text"
            className="field-input w-full"
            value={(uiState.thenLabel as string) ?? ""}
            onChange={(e) => onPatch("thenLabel", e.target.value)}
            placeholder={t("customBuilder.thenPlaceholder")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("wizard.elseLabel")}</label>
          <input
            type="text"
            className="field-input w-full"
            value={(uiState.elseLabel as string) ?? ""}
            onChange={(e) => onPatch("elseLabel", e.target.value)}
            placeholder={t("customBuilder.elsePlaceholder")}
          />
        </div>
      </div>
    </>
  );
}

type CategoryThresholdFieldsProps = {
  uiState: Record<string, unknown>;
  numberProps: PropertyResponseDto[];
  onRecompile: (newUiState: Record<string, unknown>) => void;
  t: (key: string) => string;
};

function CategoryThresholdFields({ t, uiState, numberProps, onRecompile }: CategoryThresholdFieldsProps) {
  const thresholds = (uiState.thresholds ?? []) as Array<{ threshold: string; label: string }>;

  function patchThresholds(next: Array<{ threshold: string; label: string }>) {
    onRecompile({ ...uiState, thresholds: next });
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.categoryThresholdField")}</label>
        <Combobox
          options={numberProps.map((p) => ({ label: p.name, value: p.id }))}
          value={(uiState.field as string) ?? ""}
          onChange={(val) => onRecompile({ ...uiState, field: val })}
          placeholder={t("wizard.fieldPickerPlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="type-form-label">{t("wizard.thresholdsLabel")}</p>
        {thresholds.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="number"
              className="field-input w-24"
              placeholder={t("wizard.valueLabel")}
              value={row.threshold}
              onChange={(e) => patchThresholds(thresholds.map((r, j) => (j === i ? { ...r, threshold: e.target.value } : r)))}
            />
            <span className="type-hint shrink-0">→</span>
            <input
              type="text"
              className="field-input flex-1"
              placeholder={t("wizard.valueLabel")}
              value={row.label}
              onChange={(e) => patchThresholds(thresholds.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))}
            />
            <button
              type="button"
              onClick={() => patchThresholds(thresholds.filter((_, j) => j !== i))}
              className="text-ink-muted hover:text-error transition-colors duration-150"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {thresholds.length < 3 && (
          <button
            type="button"
            onClick={() => patchThresholds([...thresholds, { threshold: "", label: "" }])}
            className="flex items-center gap-1.5 type-hint hover:text-ink-secondary transition-colors duration-150"
          >
            <Plus size={12} />
            {t("wizard.addThreshold")}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="type-form-label">{t("wizard.elseLabelCategory")}</label>
        <input
          type="text"
          className="field-input w-full"
          value={(uiState.elseLabel as string) ?? ""}
          onChange={(e) => onRecompile({ ...uiState, elseLabel: e.target.value })}
          placeholder={t("customBuilder.elsePlaceholder")}
        />
      </div>
    </>
  );
}

function RelatedRecordsFields({ config, properties, onPatch, t }: FormulaWizardProps & { t: (key: string) => string }) {
  const uiState = (config.uiState ?? {}) as Record<string, unknown>;
  const relationProps = properties.filter((p) => p.type === PropertyType.RELATION);

  const selectedRelProp = properties.find((p) => p.id === uiState.relation);
  const relConfig = selectedRelProp?.config as { relatedEntityId?: string } | undefined;
  const relatedDbId = relConfig?.relatedEntityId ?? "";

  const { data: relatedProps = [] } = useQuery({
    queryKey: ["properties", relatedDbId],
    queryFn: () => getProperties(relatedDbId),
    enabled: !!relatedDbId,
  });

  const operation = (uiState.operation as string) ?? "COUNT";
  const needsField = operation !== "COUNT";

  const filteredRelatedProps = relatedProps.filter((p) => {
    if (p.type === PropertyType.FORMULA) return false;
    if (operation === "SUM" || operation === "AVG" || operation === "MIN" || operation === "MAX") {
      return p.type === PropertyType.NUMBER;
    }
    if (operation === "EARLIEST" || operation === "LATEST") {
      return p.type === PropertyType.DATE;
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
          options={relationProps.map((p) => ({ label: p.name, value: p.id }))}
          value={(uiState.relation as string) ?? ""}
          onChange={(val) => patch("relation", val)}
          placeholder={t("wizard.fieldPickerPlaceholder")}
        />
      </div>

      {relatedDbId && (
        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("wizard.operation")}</label>
          <Select
            value={operation}
            onChange={(e) => patch("operation", e.target.value)}
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
            options={filteredRelatedProps.map((p) => ({ label: p.name, value: p.id }))}
            value={(uiState.field as string) ?? ""}
            onChange={(val) => patch("field", val)}
            placeholder={t("wizard.fieldPickerPlaceholder")}
          />
        </div>
      )}
    </>
  );
}
