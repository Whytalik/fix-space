import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG, PAIR_CATEGORIES } from "../constants";
import type { InitPropertyDef } from "../types";

export const dailyRoutineProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Назва торгової сесії або дня для зручної навігації.",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    icon: "icon:Calendar",
    config: DATE_CONFIG,
    hint: "Дата сесії. Дозволяє відстежувати активність по днях тижня.",
  },
  {
    name: "Pair",
    type: PropertyType.SELECT,
    position: 2,
    icon: "icon:TrendingUp",
    config: { isMultiSelect: false, categories: PAIR_CATEGORIES },
    hint: "Головний актив дня. Фокусування підвищує якість аналізу.",
  },
  {
    name: "Narrative",
    type: PropertyType.SELECT,
    position: 3,
    icon: "icon:MessageSquare",
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
  },
  {
    name: "Narrative Logic",
    type: PropertyType.TEXT,
    position: 4,
    icon: "icon:FileText",
    hint: "Детальне обґрунтування вашого біасу (чому ціна має йти туди).",
  },
  {
    name: "Key Catalyst",
    type: PropertyType.SELECT,
    position: 5,
    icon: "icon:Newspaper",
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "US Events",
          options: [
            { value: "CPI", color: colors.red },
            { value: "NFP", color: colors.purple },
            { value: "FOMC", color: colors.pink },
            { value: "PCE", color: colors.amber },
            { value: "GDP", color: colors.blue },
            { value: "PPI", color: colors.gold },
            { value: "Unemployment", color: colors.gray },
            { value: "Retail Sales", color: colors.green },
            { value: "ISM PMI", color: colors.brown },
            { value: "Fed Speakers", color: colors.pink },
          ],
        },
        {
          label: "Global Events",
          options: [
            { value: "ECB Rate Decision", color: colors.blue },
            { value: "BoE Rate Decision", color: colors.purple },
            { value: "BOJ Rate Decision", color: colors.amber },
            { value: "OPEC", color: colors.gold },
            { value: "Trade Balance", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Новини або події, що спричиняють волатильність у сесії.",
  },
  {
    name: "Narrative Outcome",
    type: PropertyType.SELECT,
    position: 6,
    icon: "icon:MessageSquare",
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
  },
  {
    name: "Narrative Accuracy",
    type: PropertyType.FORMULA,
    position: 7,
    config: {
      type: "CUSTOM",
      expression: "IF({{Narrative}} == {{Narrative Outcome}}, 'Correct', 'Incorrect')",
      resultType: "TEXT",
    },
    hint: "Автоматична оцінка якості вашого аналізу.",
  },
  {
    name: "Key Levels",
    type: PropertyType.TEXT,
    position: 8,
    icon: "icon:Map",
    hint: "Ключові зони (OB, FVG, S/R), виділені під час пре-маркет аналізу.",
  },
  {
    name: "Session P&L",
    type: PropertyType.FORMULA,
    position: 9,
    config: {
      type: "CUSTOM",
      expression: "SUM(MAP({{Trades}}, '{{trading-journal.Net P&L}}'))",
      resultType: "NUMBER",
    },
    hint: "Сумарний P&L всіх угод за сесію.",
  },
  {
    name: "Trade Count",
    type: PropertyType.FORMULA,
    position: 10,
    config: {
      type: "CUSTOM",
      expression: "COUNT({{Trades}})",
      resultType: "NUMBER",
    },
    hint: "Кількість угод за сесію.",
  },
  {
    name: "Account",
    type: PropertyType.RELATION,
    position: 11,
    config: { sourceDatabaseType: "accounts", multiple: false },
    hint: "Вказує основний рахунок, на якому велася робота в цю сесію.",
  },
  {
    name: "Trades",
    type: PropertyType.RELATION,
    position: 12,
    config: { sourceDatabaseType: "trading-journal", multiple: true, reversePropertyName: "Daily Routine" },
    hint: "Усі відкриті або закриті угоди протягом цієї сесії.",
  },
  {
    name: "Notes",
    type: PropertyType.RELATION,
    position: 13,
    config: { sourceDatabaseType: "notes", multiple: true },
    hint: "Спостереження за поведінкою ціни в реальному часі.",
  },
  {
    name: "Mistakes",
    type: PropertyType.RELATION,
    position: 14,
    config: { sourceDatabaseType: "mistakes", multiple: true },
    hint: "Помилки, зафіксовані саме в цей торговий день.",
  },
  {
    name: "Database",
    type: PropertyType.RELATION,
    position: 15,
    config: { sourceDatabaseType: "trading-journal", multiple: false },
    hint: "База даних для прив'язки контенту.",
  },
];
