"use client";

import { useTranslations } from "next-intl";
import type { FormulaPropertyConfig, PropertyResponseDto } from "@fixspace/domain";
import { FormulaPresetName, compileFormula } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";

import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { PRESET_META } from "./formula-presets.meta";

import { FieldPicker } from "./formula-wizard/field-picker";
import { ConditionalTextFields } from "./formula-wizard/conditional-text-fields";
import { CategoryThresholdFields } from "./formula-wizard/category-threshold-fields";
import { RelatedRecordsFields } from "./formula-wizard/related-records-fields";

type FormulaWizardProps = {
  config: FormulaPropertyConfig;
  properties: PropertyResponseDto[];
  onPatch: (patch: Partial<FormulaPropertyConfig>) => void;
};

export function FormulaWizard({ config, properties, onPatch }: FormulaWizardProps) {
  const t = useTranslations("Formula");
  const nonFormulaProps = properties.filter((property) => property.type !== PropertyType.FORMULA);
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

  const numberProps = nonFormulaProps.filter((property) => property.type === PropertyType.NUMBER);
  const numberAndRatingProps = nonFormulaProps.filter(
    (property) => property.type === PropertyType.NUMBER || property.type === PropertyType.RATING,
  );
  const checkboxProps = nonFormulaProps.filter((property) => property.type === PropertyType.CHECKBOX);
  const dateProps = nonFormulaProps.filter((property) => property.type === PropertyType.DATE);

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
              <Toggle value={!!uiState.isShort} onChange={(value) => patchUiState("isShort", value)} />
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
              options={numberAndRatingProps.map((property) => ({ label: property.name, value: property.id }))}
              value={((uiState.fields as string[]) ?? []).slice(0, 5)}
              onChange={(values) => patchUiState("fields", (values as string[]).slice(0, 5))}
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
              options={checkboxProps.map((property) => ({ label: property.name, value: property.id }))}
              value={(uiState.fields as string[]) ?? []}
              onChange={(values) => patchUiState("fields", values)}
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
              <Combobox
                value={(uiState.format as string) ?? "days"}
                onChange={(value) => patchUiState("format", value)}
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

      case FormulaPresetName.SUBTRACT:
        return (
          <>
            <FieldPicker
              label={t("wizard.subtractFieldA")}
              paramKey="fieldA"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.subtractFieldB")}
              paramKey="fieldB"
              t={t}
              options={numberProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
          </>
        );

      case FormulaPresetName.SUM_FIELDS:
        return (
          <div className="flex flex-col gap-1.5">
            <label className="type-form-label">{t("wizard.sumFieldsLabel")}</label>
            <Combobox
              multiple
              options={numberProps.map((property) => ({ label: property.name, value: property.id }))}
              value={(uiState.fields as string[]) ?? []}
              onChange={(values) => patchUiState("fields", values)}
              placeholder={t("wizard.selectNumberFields")}
            />
          </div>
        );

      case FormulaPresetName.FIELD_COMPARE:
        return (
          <>
            <FieldPicker
              label={t("wizard.compareFieldA")}
              paramKey="fieldA"
              t={t}
              options={nonFormulaProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <FieldPicker
              label={t("wizard.compareFieldB")}
              paramKey="fieldB"
              t={t}
              options={nonFormulaProps}
              uiState={uiState}
              onPatch={patchUiState}
            />
            <div className="flex flex-col gap-1.5">
              <label className="type-form-label">{t("wizard.compareOperator")}</label>
              <Combobox
                value={(uiState.operator as string) ?? "=="}
                onChange={(value) => patchUiState("operator", value)}
                options={[
                  { value: "==", label: "= (дорівнює)" },
                  { value: "!=", label: "≠ (не дорівнює)" },
                  { value: ">", label: "> (більше)" },
                  { value: "<", label: "< (менше)" },
                  { value: ">=", label: "≥ (більше або рівне)" },
                  { value: "<=", label: "≤ (менше або рівне)" },
                ]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="type-form-label">{t("wizard.compareThenLabel")}</label>
              <TextInput
                value={(uiState.thenLabel as string) ?? ""}
                onChange={(value) => patchUiState("thenLabel", value)}
                placeholder={t("wizard.compareLabelPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="type-form-label">{t("wizard.compareElseLabel")}</label>
              <TextInput
                value={(uiState.elseLabel as string) ?? ""}
                onChange={(value) => patchUiState("elseLabel", value)}
                placeholder={t("wizard.compareLabelPlaceholder")}
              />
            </div>
          </>
        );

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
    </div>
  );
}
