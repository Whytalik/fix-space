import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

const PROP_FIRM_ONLY = {
  dependsOnPropertyName: "Account Type",
  operator: "EQUALS",
  value: "Prop Firm",
} as const;

const LIVE_OR_DEMO_ONLY = {
  dependsOnPropertyName: "Account Type",
  operator: "IN",
  value: ["Live", "Demo"],
} as const;

export const accountsProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Унікальне ім'я рахунку для розділення капіталів.",
  },
  {
    name: "Account Type",
    type: PropertyType.SELECT,
    position: 1,
    icon: "icon:Wallet",
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
  },
  {
    name: "Account ID",
    type: PropertyType.TEXT,
    position: 2,
    icon: "icon:Fingerprint",
    hint: "Технічний ідентифікатор для майбутньої автоматизації імпорту.",
  },
  {
    name: "Currency",
    type: PropertyType.SELECT,
    position: 3,
    icon: "icon:CircleDollarSign",
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
  },
  {
    name: "Starting Balance",
    type: PropertyType.NUMBER,
    position: 4,
    icon: "icon:Banknote",
    config: { defaultValue: 0, format: "float" },
    hint: "Початковий капітал. Потрібен для розрахунку % дохідності.",
  },
  {
    name: "Status",
    type: PropertyType.SELECT,
    position: 5,
    icon: "icon:List",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Status",
          options: [
            { value: "Active", color: colors.green },
            { value: "Paused", color: colors.amber },
            { value: "Closed", color: colors.gray },
            { value: "Failed", color: colors.red },
          ],
        },
      ],
    },
    hint: "Поточний стан рахунку. Failed — порушення правил проп-фірми.",
  },
  {
    name: "Start Date",
    type: PropertyType.DATE,
    position: 6,
    icon: "icon:Calendar",
    config: DATE_CONFIG,
    hint: "Дата відкриття або активації рахунку.",
  },
  {
    name: "End Date",
    type: PropertyType.DATE,
    position: 7,
    icon: "icon:Calendar",
    config: DATE_CONFIG,
    hint: "Дата закриття або втрати рахунку.",
  },
  {
    name: "Max Overall Drawdown",
    type: PropertyType.NUMBER,
    position: 8,
    icon: "icon:ArrowDown",
    config: { defaultValue: 0, format: "float" },
    hint: "Гранична втрата від балансу у % або в абсолютному значенні.",
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
    hint: "Визначає механіку розрахунку ліміту втрат (тільки для проп-фірм).",
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Daily Loss Limit",
    type: PropertyType.NUMBER,
    position: 10,
    icon: "icon:ArrowDownWideNarrow",
    config: { defaultValue: 0, format: "float" },
    hint: "Ваш персональний або системний ліміт збитків на одну добу.",
  },
  {
    name: "Max Position Size",
    type: PropertyType.NUMBER,
    position: 11,
    icon: "icon:Expand",
    config: { defaultValue: 0, format: "float" },
    hint: "Максимальний сумарний об'єм активних позицій (лоти).",
  },
  {
    name: "Max Open Trades",
    type: PropertyType.NUMBER,
    position: 12,
    icon: "icon:Layers",
    config: { defaultValue: 0, format: "integer" },
    hint: "Ліміт на кількість одночасно відкритих угод.",
  },
  {
    name: "News Trading",
    type: PropertyType.SELECT,
    position: 13,
    icon: "icon:Newspaper",
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
  },
  {
    name: "Weekend Holding",
    type: PropertyType.SELECT,
    position: 14,
    icon: "icon:CalendarOff",
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
  },
  {
    name: "Hard Stop Loss",
    type: PropertyType.CHECKBOX,
    position: 15,
    icon: "icon:ShieldCheck",
    hint: "Чи є виставлення фізичного Stop Loss обов'язковою умовою.",
  },
  {
    name: "Provider",
    type: PropertyType.SELECT,
    position: 16,
    icon: "icon:Building2",
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
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Phase",
    type: PropertyType.SELECT,
    position: 17,
    icon: "icon:Milestone",
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
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Profit Target",
    type: PropertyType.NUMBER,
    position: 18,
    icon: "icon:Target",
    config: { defaultValue: 0, format: "float" },
    hint: "Ціль прибутку у відсотках (%).",
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Consistency Rule",
    type: PropertyType.NUMBER,
    position: 19,
    config: { defaultValue: 0, format: "float" },
    hint: "Правило консистенції прибутку у відсотках (%).",
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Min Trading Days",
    type: PropertyType.NUMBER,
    position: 20,
    config: { defaultValue: 0, format: "integer" },
    hint: "Мінімальна кількість торгових днів для проходження фази.",
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Profit Split",
    type: PropertyType.NUMBER,
    position: 21,
    icon: "icon:PieChart",
    config: { defaultValue: 0, format: "float" },
    hint: "Розподіл прибутку у відсотках (частка трейдера).",
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Challenge Fee",
    type: PropertyType.NUMBER,
    position: 22,
    icon: "icon:Receipt",
    config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
    hint: "Вартість виклику / плата за участь у проп-програмі.",
    visibilityCondition: PROP_FIRM_ONLY,
  },
  {
    name: "Broker",
    type: PropertyType.TEXT,
    position: 23,
    icon: "icon:Building",
    hint: "Назва брокера для live або demo рахунку.",
    visibilityCondition: LIVE_OR_DEMO_ONLY,
  },
  {
    name: "Platform",
    type: PropertyType.SELECT,
    position: 24,
    icon: "icon:Monitor",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Platform",
          options: [
            { value: "MT4", color: colors.blue },
            { value: "MT5", color: colors.purple },
            { value: "cTrader", color: colors.green },
            { value: "TradingView", color: colors.amber },
            { value: "NinjaTrader", color: colors.pink },
            { value: "Other", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Торгова платформа для live або demo рахунку.",
    visibilityCondition: LIVE_OR_DEMO_ONLY,
  },
  {
    name: "Leverage",
    type: PropertyType.SELECT,
    position: 25,
    icon: "icon:ZoomIn",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Leverage",
          options: [
            { value: "1:10", color: colors.green },
            { value: "1:20", color: colors.green },
            { value: "1:30", color: colors.amber },
            { value: "1:50", color: colors.amber },
            { value: "1:100", color: colors.red },
            { value: "1:200", color: colors.red },
            { value: "1:500", color: colors.red },
          ],
        },
      ],
    },
    hint: "Кредитне плече для live або demo рахунку.",
    visibilityCondition: LIVE_OR_DEMO_ONLY,
  },
  {
    name: "Operations",
    type: PropertyType.RELATION,
    position: 26,
    config: { sourceDatabaseType: "operations", multiple: true },
    hint: "Всі фінансові транзакції рахунку.",
  },
  {
    name: "Trades",
    type: PropertyType.RELATION,
    position: 27,
    config: { sourceDatabaseType: "trading-journal", multiple: true, reversePropertyName: "Account" },
    hint: "Усі угоди, зафіксовані на цьому рахунку.",
  },
];
