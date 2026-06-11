"use client";

import { useTranslations } from "next-intl";
import type { FormulaPropertyConfig, PropertyResponseDto } from "@fixspace/domain";
import { FormulaType } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";
import { toFieldKey } from "@fixspace/domain";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { Select } from "@/components/ui/primitives/inputs/select";
import { TabSwitcher } from "@/components/ui/primitives/navigation/tab-switcher";

type FormulaCustomBuilderProps = {
  config: FormulaPropertyConfig;
  properties: PropertyResponseDto[];
  onPatch: (patch: Partial<FormulaPropertyConfig>) => void;
};

export function FormulaCustomBuilder({ config, properties, onPatch }: FormulaCustomBuilderProps) {
  const t = useTranslations("Formula");
  const uiState = (config.uiState ?? {}) as Record<string, unknown>;
  const mode = (uiState.builderMode as string) ?? "calculate";
  const nonFormulaProps = properties.filter((p) => p.type !== PropertyType.FORMULA);
  const numberProps = nonFormulaProps.filter((p) => p.type === PropertyType.NUMBER);

  function patchUiState(key: string, value: unknown) {
    buildExpression({ ...uiState, [key]: value });
  }

  function buildExpression(newUiState: Record<string, unknown>) {
    const m = (newUiState.builderMode as string) ?? "calculate";
    let expression = "";
    let resultType: PropertyType = PropertyType.NUMBER;

    if (m === "calculate") {
      const leftType = (newUiState.leftType as string) ?? "field";
      const rightType = (newUiState.rightType as string) ?? "field";
      const op = (newUiState.op as string) ?? "+";

      const left = leftType === "field" ? toFieldKey((newUiState.leftField as string) ?? "") : ((newUiState.leftNumber as string) ?? "0");

      const right =
        rightType === "field" ? toFieldKey((newUiState.rightField as string) ?? "") : ((newUiState.rightNumber as string) ?? "0");

      expression = `${left} ${op} ${right}`;
      resultType = PropertyType.NUMBER;
    } else {
      const condField = toFieldKey((newUiState.condField as string) ?? "");
      const condOp = (newUiState.condOp as string) ?? "==";
      const condValue = (newUiState.condValue as string) ?? "";
      const thenLabel = ((newUiState.thenLabel as string) ?? "").replace(/'/g, "\\'");
      const elseLabel = ((newUiState.elseLabel as string) ?? "").replace(/'/g, "\\'");

      const valueExpr = isNaN(Number(condValue)) ? `'${condValue.replace(/'/g, "\\'")}'` : condValue;

      expression = `IF(${condField} ${condOp} ${valueExpr}, '${thenLabel}', '${elseLabel}')`;
      resultType = PropertyType.TEXT;
    }

    onPatch({ type: FormulaType.CUSTOM, uiState: newUiState, expression, resultType });
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-surface rounded-2xl border border-stroke">
      <TabSwitcher
        active={mode}
        onChange={(value) => buildExpression({ ...uiState, builderMode: value })}
        items={[
          { label: t("customBuilder.calculate"), id: "calculate" },
          { label: t("customBuilder.conditional"), id: "conditional" },
        ]}
      />

      {mode === "calculate" ? (
        <div className="flex flex-col gap-3">
          <OperandPicker
            label={t("customBuilder.leftOperand")}
            typeKey="leftType"
            fieldKey="leftField"
            numberKey="leftNumber"
            uiState={uiState}
            properties={numberProps}
            onPatch={patchUiState}
            t={t}
          />
          <div className="flex flex-col gap-1.5">
            <label className="type-form-label">{t("customBuilder.operation")}</label>
            <Select
              value={(uiState.op as string) ?? "+"}
              onChange={(e) => patchUiState("op", e.target.value)}
              options={[
                { value: "+", label: `+ ${t("customBuilder.add")}` },
                { value: "-", label: `− ${t("customBuilder.subtract")}` },
                { value: "*", label: `× ${t("customBuilder.multiply")}` },
                { value: "/", label: `÷ ${t("customBuilder.divide")}` },
              ]}
            />
          </div>
          <OperandPicker
            label={t("customBuilder.rightOperand")}
            typeKey="rightType"
            fieldKey="rightField"
            numberKey="rightNumber"
            uiState={uiState}
            properties={numberProps}
            onPatch={patchUiState}
            t={t}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="type-form-label">{t("customBuilder.checkField")}</label>
            <Combobox
              options={nonFormulaProps.map((p) => ({ label: p.name, value: p.id }))}
              value={(uiState.condField as string) ?? ""}
              onChange={(val) => patchUiState("condField", val)}
              placeholder={t("customBuilder.fieldPlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="type-form-label">{t("customBuilder.condition")}</label>
            <Select
              value={(uiState.condOp as string) ?? "=="}
              onChange={(e) => patchUiState("condOp", e.target.value)}
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
            <label className="type-form-label">{t("customBuilder.value")}</label>
            <input
              type="text"
              className="field-input w-full"
              value={(uiState.condValue as string) ?? ""}
              onChange={(e) => patchUiState("condValue", e.target.value)}
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
                onChange={(e) => patchUiState("thenLabel", e.target.value)}
                placeholder={t("customBuilder.thenPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="type-form-label">{t("wizard.elseLabel")}</label>
              <input
                type="text"
                className="field-input w-full"
                value={(uiState.elseLabel as string) ?? ""}
                onChange={(e) => patchUiState("elseLabel", e.target.value)}
                placeholder={t("customBuilder.elsePlaceholder")}
              />
            </div>
          </div>
        </div>
      )}

      {config.expression && (
        <div className="pt-3 border-t border-stroke">
          <p className="type-hint uppercase tracking-widest mb-1.5">{t("customBuilder.expression")}</p>
          <div className="px-3 py-2 bg-canvas rounded-lg border border-stroke">
            <p className="font-mono text-xs text-ink-secondary truncate">{config.expression}</p>
          </div>
        </div>
      )}
    </div>
  );
}

type OperandPickerProps = {
  label: string;
  typeKey: string;
  fieldKey: string;
  numberKey: string;
  uiState: Record<string, unknown>;
  properties: PropertyResponseDto[];
  onPatch: (key: string, value: unknown) => void;
  t: (key: string) => string;
};

function OperandPicker({ label, typeKey, fieldKey, numberKey, uiState, properties, onPatch, t }: OperandPickerProps) {
  const type = (uiState[typeKey] as string) ?? "field";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="type-form-label">{label}</label>
      <div className="flex gap-2">
        <select className="field-input w-28 shrink-0" value={type} onChange={(e) => onPatch(typeKey, e.target.value)}>
          <option value="field">{t("customBuilder.field")}</option>
          <option value="number">{t("customBuilder.number")}</option>
        </select>
        <div className="flex-1 min-w-0">
          {type === "field" ? (
            <Combobox
              options={properties.map((p) => ({ label: p.name, value: p.id }))}
              value={(uiState[fieldKey] as string) ?? ""}
              onChange={(val) => onPatch(fieldKey, val)}
              placeholder={t("customBuilder.fieldPlaceholder")}
            />
          ) : (
            <input
              type="number"
              className="field-input w-full"
              value={(uiState[numberKey] as string) ?? ""}
              onChange={(e) => onPatch(numberKey, e.target.value)}
              placeholder="0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
