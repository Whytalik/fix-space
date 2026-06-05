import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const accountsProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    isRequired: true,
    position: 0,
    hint: "Унікальне ім'я рахунку для розділення капіталів.",
    group: "General Info",
  },
  {
    name: "Account Type",
    type: PropertyType.SELECT,
    position: 1,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Type",
          options: [
            { value: "Prop Firm", color: colors.purple },
            { value: "Live", color: colors.green },
            { value: "Demo", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Визначає правила та ризики для цього рахунку.",
    group: "General Info",
  },
  {
    name: "Account ID",
    type: PropertyType.TEXT,
    position: 2,
    hint: "Технічний ідентифікатор для майбутньої автоматизації імпорту.",
    group: "General Info",
  },
  {
    name: "Currency",
    type: PropertyType.SELECT,
    position: 3,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Currencies",
          options: [
            { value: "USD", color: colors.green },
            { value: "EUR", color: colors.blue },
            { value: "GBP", color: colors.purple },
            { value: "USDT", color: colors.amber },
            { value: "BTC", color: colors.gold },
            { value: "UAH", color: colors.pink },
          ],
        },
      ],
    },
    hint: "Валюта розрахунків. База для всіх фінансових полів.",
    group: "General Info",
  },
  {
    name: "Starting Balance",
    type: PropertyType.NUMBER,
    position: 4,
    config: { defaultValue: 0, format: "float" },
    hint: "Початковий капітал. Потрібен для розрахунку % дохідності.",
    group: "General Info",
  },
  {
    name: "Status",
    type: PropertyType.SELECT,
    position: 5,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Status",
          options: [
            { value: "Active", color: colors.green },
            { value: "Closed", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Чи використовується рахунок зараз.",
    group: "General Info",
  },
  {
    name: "Start Date",
    type: PropertyType.DATE,
    position: 6,
    config: DATE_CONFIG,
    hint: "Дата відкриття або активації рахунку.",
    group: "General Info",
  },
  {
    name: "End Date",
    type: PropertyType.DATE,
    position: 7,
    config: DATE_CONFIG,
    hint: "Дата закриття або втрати рахунку.",
    group: "General Info",
  },
  {
    name: "Max Overall Drawdown",
    type: PropertyType.NUMBER,
    position: 8,
    config: { defaultValue: 0, format: "float" },
    hint: "Гранична втрата від балансу, після якої рахунок вважається втраченим.",
    group: "Risk & Compliance",
  },
  {
    name: "Drawdown Type",
    type: PropertyType.SELECT,
    position: 9,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Drawdown Types",
          options: [
            { value: "Static", color: colors.blue },
            { value: "Trailing", color: colors.amber },
            { value: "Relative", color: colors.purple },
          ],
        },
      ],
    },
    hint: "Визначає механіку розрахунку ліміту втрат.",
    group: "Risk & Compliance",
  },
  {
    name: "Daily Loss Limit",
    type: PropertyType.NUMBER,
    position: 10,
    config: { defaultValue: 0, format: "float" },
    hint: "Ваш персональний або системний ліміт збитків на одну добу.",
    group: "Risk & Compliance",
  },
  {
    name: "Max Position Size",
    type: PropertyType.NUMBER,
    position: 11,
    config: { defaultValue: 0, format: "float" },
    hint: "Максимальний сумарний об'єм активних позицій.",
    group: "Risk & Compliance",
  },
  {
    name: "Max Open Trades",
    type: PropertyType.NUMBER,
    position: 12,
    config: { defaultValue: 0, format: "integer" },
    hint: "Ліміт на кількість одночасно відкритих угод.",
    group: "Risk & Compliance",
  },
  {
    name: "News Trading",
    type: PropertyType.SELECT,
    position: 13,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "News Trading",
          options: [
            { value: "Allowed", color: colors.green },
            { value: "Restricted", color: colors.red },
          ],
        },
      ],
    },
    hint: "Чи дозволено відкривати угоди під час волатильних новин.",
    group: "Risk & Compliance",
  },
  {
    name: "Weekend Holding",
    type: PropertyType.SELECT,
    position: 14,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Weekend Holding",
          options: [
            { value: "Allowed", color: colors.green },
            { value: "Forbidden", color: colors.red },
          ],
        },
      ],
    },
    hint: "Чи дозволено залишати позиції відкритими на вихідні.",
    group: "Risk & Compliance",
  },
  {
    name: "Hard Stop Loss",
    type: PropertyType.CHECKBOX,
    position: 15,
    hint: "Чи є виставлення фізичного Stop Loss обов'язковою умовою.",
    group: "Risk & Compliance",
  },
  {
    name: "Provider",
    type: PropertyType.SELECT,
    position: 16,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Prop Providers",
          options: [
            { value: "FTMO", color: colors.blue },
            { value: "Apex", color: colors.amber },
            { value: "Topstep", color: colors.gold },
            { value: "MyFundedFX", color: colors.purple },
            { value: "FundingPips", color: colors.pink },
            { value: "Goat Funded", color: colors.green },
            { value: "The 5ers", color: colors.red },
          ],
        },
      ],
    },
    hint: "Провайдер проп-рахунку.",
    group: "Prop Firm Specific",
    visibilityCondition: {
      dependsOnPropertyName: "Account Type",
      operator: "EQUALS",
      value: "Prop Firm",
    },
  },
  {
    name: "Phase",
    type: PropertyType.SELECT,
    position: 17,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Phase",
          options: [
            { value: "Challenge", color: colors.amber },
            { value: "Verification", color: colors.blue },
            { value: "Funded", color: colors.green },
          ],
        },
      ],
    },
    hint: "Поточна фаза проходження проп-рахунку.",
    group: "Prop Firm Specific",
    visibilityCondition: {
      dependsOnPropertyName: "Account Type",
      operator: "EQUALS",
      value: "Prop Firm",
    },
  },
  {
    name: "Profit Target",
    type: PropertyType.NUMBER,
    position: 18,
    config: { defaultValue: 0, format: "float" },
    hint: "Ціль прибутку у відсотках.",
    group: "Prop Firm Specific",
    visibilityCondition: {
      dependsOnPropertyName: "Account Type",
      operator: "EQUALS",
      value: "Prop Firm",
    },
  },
  {
    name: "Consistency Rule",
    type: PropertyType.NUMBER,
    position: 19,
    config: { defaultValue: 0, format: "float" },
    hint: "Правило консистенції прибутку у відсотках.",
    group: "Prop Firm Specific",
    visibilityCondition: {
      dependsOnPropertyName: "Account Type",
      operator: "EQUALS",
      value: "Prop Firm",
    },
  },
  {
    name: "Min Trading Days",
    type: PropertyType.NUMBER,
    position: 20,
    config: { defaultValue: 0, format: "integer" },
    hint: "Мінімальна кількість торгових днів.",
    group: "Prop Firm Specific",
    visibilityCondition: {
      dependsOnPropertyName: "Account Type",
      operator: "EQUALS",
      value: "Prop Firm",
    },
  },
  {
    name: "Profit Split",
    type: PropertyType.NUMBER,
    position: 21,
    config: { defaultValue: 0, format: "float" },
    hint: "Розподіл прибутку у відсотках (частка трейдера).",
    group: "Prop Firm Specific",
    visibilityCondition: {
      dependsOnPropertyName: "Account Type",
      operator: "EQUALS",
      value: "Prop Firm",
    },
  },
  {
    name: "Operations",
    type: PropertyType.RELATION,
    position: 22,
    config: { sourceDatabaseType: "operations", multiple: true },
    hint: "Всі фінансові транзакції рахунку.",
    group: "Relations",
  },
  {
    name: "Trades",
    type: PropertyType.RELATION,
    position: 23,
    config: { sourceDatabaseType: "trading-journal", multiple: true },
    hint: "Усі угоди, зафіксовані на цьому рахунку.",
    group: "Relations",
  },
];
