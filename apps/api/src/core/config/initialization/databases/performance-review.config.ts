import { PropertyType } from "@fixspace/domain";
import { DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const performanceReviewProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Заголовок огляду.",
    group: "General",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    config: DATE_CONFIG,
    hint: "Дата проведення глибокого аналізу періоду.",
    group: "General",
  },
  {
    name: "Period",
    type: PropertyType.SELECT,
    position: 2,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Period",
          options: [
            { value: "Weekly", color: "#2563EB" },
            { value: "Monthly", color: "#7C3AED" },
          ],
        },
      ],
    },
    hint: "Тип аналізованого відрізку часу.",
    group: "General",
  },
  {
    name: "Period Start",
    type: PropertyType.DATE,
    position: 3,
    config: DATE_CONFIG,
    hint: "Дата початку періоду.",
    group: "General",
  },
  {
    name: "Period End",
    type: PropertyType.DATE,
    position: 4,
    config: DATE_CONFIG,
    hint: "Дата закінчення періоду.",
    group: "General",
  },
  {
    name: "Net P&L",
    type: PropertyType.FORMULA,
    position: 5,
    config: {
      type: "CUSTOM",
      expression: "SUM(MAP({{Trades}}, '{{trading-journal.Net P&L}}'))",
      resultType: "NUMBER",
    },
    hint: "Ваш реальний чистий заробіток за цей час.",
    group: "Stats",
  },
  {
    name: "Trade Count",
    type: PropertyType.FORMULA,
    position: 6,
    config: {
      type: "CUSTOM",
      expression: "COUNT({{Trades}})",
      resultType: "NUMBER",
    },
    hint: "Активність угод.",
    group: "Stats",
  },
  {
    name: "Win Rate",
    type: PropertyType.FORMULA,
    position: 7,
    config: {
      type: "CUSTOM",
      expression: "0",
      resultType: "NUMBER",
    },
    hint: "Якість вибору сетапів протягом періоду.",
    group: "Stats",
  },
  {
    name: "Grade",
    type: PropertyType.SELECT,
    position: 8,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Grade",
          options: [
            { value: "A", color: "#16A34A" },
            { value: "B", color: "#2563EB" },
            { value: "C", color: "#CA8A04" },
            { value: "D", color: "#D97706" },
            { value: "F", color: "#DC2626" },
          ],
        },
      ],
    },
    hint: "Ваша чесна суб'єктивна оцінка своєї роботи.",
    group: "General",
  },
  {
    name: "Account",
    type: PropertyType.RELATION,
    position: 9,
    config: { sourceDatabaseType: "accounts", multiple: false },
    hint: "Рахунок, для якого робиться огляд.",
    group: "Relations",
  },
  {
    name: "Trades",
    type: PropertyType.RELATION,
    position: 10,
    config: { sourceDatabaseType: "trading-journal", multiple: true },
    hint: "Усі угоди, що увійшли в цей період.",
    group: "Relations",
  },
  {
    name: "Mistakes",
    type: PropertyType.RELATION,
    position: 11,
    config: { sourceDatabaseType: "mistakes", multiple: true },
    hint: "Головні помилки, допущені за період.",
    group: "Relations",
  },
];
