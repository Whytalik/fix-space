import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG, FORMULA_TEXT } from "../constants";
import type { InitPropertyDef } from "../types";

export const notesProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Короткий заголовок, що відображає суть інсайту або уроку.",
    group: "General",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    config: DATE_CONFIG,
    hint: "Дата фіксації ідеї. Допомагає відстежувати вашу еволюцію.",
    group: "General",
  },
  {
    name: "Category",
    type: PropertyType.SELECT,
    position: 2,
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Mistake Categories",
          options: [
            { value: "Preparation", color: colors.blue },
            { value: "Execution", color: colors.amber },
            { value: "Management", color: colors.purple },
            { value: "Exit", color: colors.red },
            { value: "Psychology", color: colors.pink },
          ],
        },
      ],
    },
    hint: "Групування за темою для зручного навчання.",
    group: "General",
  },
  {
    name: "Confidence",
    type: PropertyType.SELECT,
    position: 3,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Confidence",
          options: [
            { value: "Backtested", color: colors.green },
            { value: "Forwardtested", color: colors.blue },
            { value: "Live Observation", color: colors.amber },
            { value: "Guess", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Рівень впевненості: від здогадки до патерна.",
    group: "General",
  },
  {
    name: "Source",
    type: PropertyType.SELECT,
    position: 4,
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Source",
          options: [
            { value: "Trade Loss", color: colors.red },
            { value: "Trade Win", color: colors.green },
            { value: "Book", color: colors.blue },
            { value: "Mentor", color: colors.purple },
            { value: "Backtest", color: colors.pink },
            { value: "Journal Review", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Звідки ви взяли цей інсайт (помилка, книга, ментор).",
    group: "General",
  },
  {
    name: "Market Regime",
    type: PropertyType.SELECT,
    position: 5,
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Market Regimes",
          options: [
            { value: "Bullish Trend", color: colors.green },
            { value: "Bearish Trend", color: colors.red },
            { value: "Ranging/Chop", color: colors.gray },
            { value: "Volatile", color: colors.amber },
            { value: "Consolidation", color: colors.blue },
          ],
        },
      ],
    },
    hint: "Тип ринку, за якого цей інсайт є актуальним.",
    group: "General",
  },
  {
    name: "Status",
    type: PropertyType.SELECT,
    position: 6,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Status",
          options: [
            { value: "Active", color: colors.blue },
            { value: "Archived", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Актуальність нотатки. Дозволяє архівувати старі правила.",
    group: "General",
  },
  {
    name: "Last Used",
    type: PropertyType.FORMULA,
    position: 7,
    config: FORMULA_TEXT,
    hint: "Дата, коли ви востаннє посилалися на цей інсайт в угодах.",
    group: "General",
  },
  {
    name: "Trading Journal",
    type: PropertyType.RELATION,
    position: 8,
    config: { sourceDatabaseType: "trading-journal", multiple: true },
    hint: "Угоди, у яких цей інсайт був застосований або помічений.",
    group: "Relations",
  },
  {
    name: "Daily Routines",
    type: PropertyType.RELATION,
    position: 9,
    config: { sourceDatabaseType: "daily-routine", multiple: true },
    hint: "Сесії, під час яких з'явилася ця нотатка.",
    group: "Relations",
  },
];
