import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG, FORMULA_TEXT } from "../constants";
import type { InitPropertyDef } from "../types";

export const mistakesProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    isRequired: true,
    position: 0,
    hint: "Чітка назва помилки. Допомагає визнати проблему.",
    group: "General",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    config: DATE_CONFIG,
    hint: "Коли помилка була допущена вперше. Трекінг рецидивів.",
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
    hint: "Де саме стався збій: у підготовці чи виконанні.",
    group: "General",
  },
  {
    name: "Prevention Rule",
    type: PropertyType.TEXT,
    position: 3,
    hint: "Правило, яке допоможе уникнути помилки в майбутньому.",
    group: "General",
  },
  {
    name: "Status",
    type: PropertyType.SELECT,
    position: 4,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Status",
          options: [
            { value: "Active", color: colors.red },
            { value: "Resolved", color: colors.green },
          ],
        },
      ],
    },
    hint: "Чи вважаєте ви цю проблему вирішеною.",
    group: "General",
  },
  {
    name: "Resolved Date",
    type: PropertyType.DATE,
    position: 5,
    config: DATE_CONFIG,
    hint: "Дата, після якої помилка більше не повторювалася.",
    group: "General",
  },
  {
    name: "Severity",
    type: PropertyType.FORMULA,
    position: 6,
    config: FORMULA_TEXT,
    hint: "Рівень небезпеки помилки на основі її частоти.",
    group: "Stats",
  },
  {
    name: "Total Cost",
    type: PropertyType.FORMULA,
    position: 7,
    config: FORMULA_TEXT,
    hint: "Об'єктивна фінансова шкода, яку помилка нанесла балансу.",
    group: "Stats",
  },
  {
    name: "Last Used",
    type: PropertyType.FORMULA,
    position: 8,
    config: FORMULA_TEXT,
    hint: "Дата останнього повторення.",
    group: "Stats",
  },
  {
    name: "Trading Journal",
    type: PropertyType.RELATION,
    position: 9,
    config: { sourceDatabaseType: "trading-journal", multiple: true },
    hint: "Усі угоди, які постраждали від цієї помилки.",
    group: "Relations",
  },
  {
    name: "Daily Routines",
    type: PropertyType.RELATION,
    position: 10,
    config: { sourceDatabaseType: "daily-routine", multiple: true },
    hint: "Дні, коли ця помилка повторювалася.",
    group: "Relations",
  },
];
