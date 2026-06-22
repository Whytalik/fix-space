import type { PropertyResponseDto } from "@fixspace/domain";
import { FormulaPresetName } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";

export interface PresetMeta {
  name: string;
  description: string;
  nameKey: string;
  descriptionKey: string;
  isAvailable: (properties: PropertyResponseDto[]) => boolean;
}

const hasN = (type: PropertyType, n: number) => (props: PropertyResponseDto[]) => props.filter((p) => p.type === type).length >= n;

export const PRESET_META: Record<FormulaPresetName, PresetMeta> = {
  [FormulaPresetName.CONDITIONAL_TEXT]: {
    name: "Умовний текст",
    description: "Показує одну з двох міток залежно від значення поля",
    nameKey: "presets.CONDITIONAL_TEXT.name",
    descriptionKey: "presets.CONDITIONAL_TEXT.description",
    isAvailable: () => true,
  },
  [FormulaPresetName.DATE_DIFF]: {
    name: "Різниця між датами",
    description: "Тривалість між двома датами: дні, години або тижні",
    nameKey: "presets.DATE_DIFF.name",
    descriptionKey: "presets.DATE_DIFF.description",
    isAvailable: hasN(PropertyType.DATE, 2),
  },
  [FormulaPresetName.PERCENTAGE]: {
    name: "Відсоток",
    description: "Ділить одне числове поле на інше та множить на 100",
    nameKey: "presets.PERCENTAGE.name",
    descriptionKey: "presets.PERCENTAGE.description",
    isAvailable: hasN(PropertyType.NUMBER, 2),
  },
  [FormulaPresetName.RELATED_RECORDS]: {
    name: "По пов'язаних записах",
    description: "Агрегує або перелічує значення полів з пов'язаної бази",
    nameKey: "presets.RELATED_RECORDS.name",
    descriptionKey: "presets.RELATED_RECORDS.description",
    isAvailable: (props) => props.some((p) => p.type === PropertyType.RELATION),
  },
  [FormulaPresetName.AVG_SCORE]: {
    name: "Середній бал",
    description: "Середнє арифметичне від 2 до 5 числових або рейтингових полів",
    nameKey: "presets.AVG_SCORE.name",
    descriptionKey: "presets.AVG_SCORE.description",
    isAvailable: (props) => props.filter((p) => p.type === PropertyType.NUMBER || p.type === PropertyType.RATING).length >= 2,
  },
  [FormulaPresetName.CATEGORY_THRESHOLD]: {
    name: "Категорія за порогом",
    description: "Присвоює текстову мітку залежно від числового діапазону (A/B/C)",
    nameKey: "presets.CATEGORY_THRESHOLD.name",
    descriptionKey: "presets.CATEGORY_THRESHOLD.description",
    isAvailable: (props) => props.some((p) => p.type === PropertyType.NUMBER),
  },
  [FormulaPresetName.R_MULTIPLE]: {
    name: "R-Multiple",
    description: "Скільки R повернула угода: P&L / Ризик",
    nameKey: "presets.R_MULTIPLE.name",
    descriptionKey: "presets.R_MULTIPLE.description",
    isAvailable: hasN(PropertyType.NUMBER, 2),
  },
  [FormulaPresetName.PLANNED_RR]: {
    name: "Запланований RR",
    description: "Ризик/дохід до входу: (Ціль − Вхід) / (Вхід − Стоп)",
    nameKey: "presets.PLANNED_RR.name",
    descriptionKey: "presets.PLANNED_RR.description",
    isAvailable: hasN(PropertyType.NUMBER, 3),
  },
  [FormulaPresetName.RISK_PCT_BALANCE]: {
    name: "Ризик % від балансу",
    description: "(Сума ризику / Баланс) × 100 — для prop firm трейдерів",
    nameKey: "presets.RISK_PCT_BALANCE.name",
    descriptionKey: "presets.RISK_PCT_BALANCE.description",
    isAvailable: hasN(PropertyType.NUMBER, 2),
  },
  [FormulaPresetName.RULE_COMPLIANCE]: {
    name: "Дотримання правил",
    description: "Відсоток виконаних правил із обраних чекбоксів",
    nameKey: "presets.RULE_COMPLIANCE.name",
    descriptionKey: "presets.RULE_COMPLIANCE.description",
    isAvailable: (props) => props.some((p) => p.type === PropertyType.CHECKBOX),
  },
  [FormulaPresetName.SUBTRACT]: {
    name: "Різниця",
    description: "Віднімає одне числове поле від іншого (A − B)",
    nameKey: "presets.SUBTRACT.name",
    descriptionKey: "presets.SUBTRACT.description",
    isAvailable: hasN(PropertyType.NUMBER, 2),
  },
  [FormulaPresetName.SUM_FIELDS]: {
    name: "Сума полів",
    description: "Складає кілька числових полів",
    nameKey: "presets.SUM_FIELDS.name",
    descriptionKey: "presets.SUM_FIELDS.description",
    isAvailable: hasN(PropertyType.NUMBER, 2),
  },
  [FormulaPresetName.FIELD_COMPARE]: {
    name: "Порівняння полів",
    description: "Порівнює два поля й повертає текстову мітку",
    nameKey: "presets.FIELD_COMPARE.name",
    descriptionKey: "presets.FIELD_COMPARE.description",
    isAvailable: () => true,
  },
};
