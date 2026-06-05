import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG, PAIR_CATEGORIES, FORMULA_TEXT } from "../constants";
import type { InitPropertyDef } from "../types";

export const dailyRoutineProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    isRequired: true,
    position: 0,
    hint: "Назва торгової сесії або дня для зручної навігації.",
    group: "General",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    config: DATE_CONFIG,
    hint: "Дата сесії. Дозволяє відстежувати активність по днях тижня.",
    group: "General",
  },
  {
    name: "Pair",
    type: PropertyType.SELECT,
    position: 2,
    config: { isMultiSelect: false, categories: PAIR_CATEGORIES },
    hint: "Головний актив дня. Фокусування підвищує якість аналізу.",
    group: "General",
  },
  {
    name: "Narrative",
    type: PropertyType.SELECT,
    position: 3,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Bias",
          options: [
            { value: "Bullish", color: colors.green },
            { value: "Bearish", color: colors.red },
            { value: "Neutral", color: colors.gray },
            { value: "Uncertain", color: colors.amber },
          ],
        },
      ],
    },
    hint: "Ваш очікуваний напрямок ринку на основі HTF.",
    group: "Analysis",
  },
  {
    name: "Narrative Logic",
    type: PropertyType.TEXT,
    position: 4,
    hint: "Детальне обґрунтування вашого біасу (чому ціна має йти туди).",
    group: "Analysis",
  },
  {
    name: "Key Catalyst",
    type: PropertyType.SELECT,
    position: 5,
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Events",
          options: [
            { value: "CPI", color: colors.red },
            { value: "NFP", color: colors.purple },
            { value: "FOMC", color: colors.pink },
          ],
        },
      ],
    },
    hint: "Новини або події, що спричиняють волатильність.",
    group: "Analysis",
  },
  {
    name: "Narrative Outcome",
    type: PropertyType.SELECT,
    position: 6,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Bias",
          options: [
            { value: "Bullish", color: colors.green },
            { value: "Bearish", color: colors.red },
            { value: "Neutral", color: colors.gray },
            { value: "Uncertain", color: colors.amber },
          ],
        },
      ],
    },
    hint: "Фактичний напрямок, який показав ринок під час сесії.",
    group: "Analysis",
  },
  {
    name: "Narrative Accuracy",
    type: PropertyType.FORMULA,
    position: 7,
    config: FORMULA_TEXT,
    hint: "Автоматична оцінка якості вашого аналізу.",
    group: "Analysis",
  },
  {
    name: "Account",
    type: PropertyType.RELATION,
    position: 8,
    config: { sourceDatabaseType: "accounts", multiple: false },
    hint: "Вказує основний рахунок, на якому велася робота в цю сесію.",
    group: "Relations",
  },
  {
    name: "Trades",
    type: PropertyType.RELATION,
    position: 9,
    config: { sourceDatabaseType: "trading-journal", multiple: true },
    hint: "Усі відкриті або закриті угоди протягом цієї сесії.",
    group: "Relations",
  },
  {
    name: "Notes",
    type: PropertyType.RELATION,
    position: 10,
    config: { sourceDatabaseType: "notes", multiple: true },
    hint: "Спостереження за поведінкою ціни в реальному часі.",
    group: "Relations",
  },
  {
    name: "Mistakes",
    type: PropertyType.RELATION,
    position: 11,
    config: { sourceDatabaseType: "mistakes", multiple: true },
    hint: "Помилки, зафіксовані саме в цей торговий день.",
    group: "Relations",
  },
];
