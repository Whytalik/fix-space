import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const mistakesProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Чітка назва помилки. Допомагає визнати проблему.",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    icon: "icon:Calendar",
    config: DATE_CONFIG,
    hint: "Коли помилка була допущена вперше. Трекінг рецидивів.",
  },
  {
    name: "Category",
    type: PropertyType.SELECT,
    position: 2,
    icon: "icon:Tag",
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Mistake Categories",
          options: [
            { value: "Preparation", color: colors.blue },
            { value: "Analysis", color: colors.gold },
            { value: "Execution", color: colors.amber },
            { value: "Management", color: colors.purple },
            { value: "Exit", color: colors.red },
            { value: "Psychology", color: colors.pink },
          ],
        },
      ],
    },
    hint: "Де саме стався збій: у підготовці, аналізі чи виконанні.",
  },
  {
    name: "Trigger",
    type: PropertyType.SELECT,
    position: 3,
    icon: "icon:Zap",
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Triggers",
          options: [
            { value: "Losing Streak", color: colors.red },
            { value: "Winning Streak", color: colors.green },
            { value: "FOMO", color: colors.purple },
            { value: "Overconfidence", color: colors.gold },
            { value: "Boredom", color: colors.gray },
            { value: "News Event", color: colors.amber },
            { value: "Large Position", color: colors.pink },
            { value: "Drawdown", color: colors.brown },
          ],
        },
      ],
    },
    hint: "Що спровокувало помилку. Допомагає виявляти патерни рецидивів.",
  },
  {
    name: "Impact Type",
    type: PropertyType.SELECT,
    position: 4,
    icon: "icon:Target",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Impact Type",
          options: [
            { value: "Financial Loss", color: colors.red },
            { value: "Missed Opportunity", color: colors.amber },
            { value: "Rule Violation", color: colors.purple },
            { value: "Psychological", color: colors.pink },
          ],
        },
      ],
    },
    hint: "Тип збитку — фінансовий, пропущена можливість або порушення правил.",
  },
  {
    name: "Prevention Rule",
    type: PropertyType.TEXT,
    position: 5,
    icon: "icon:Shield",
    hint: "Правило, яке допоможе уникнути помилки в майбутньому.",
  },
  {
    name: "Status",
    type: PropertyType.SELECT,
    position: 6,
    icon: "icon:List",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Status",
          options: [
            { value: "Active", color: colors.red },
            { value: "Monitoring", color: colors.amber },
            { value: "Resolved", color: colors.green },
          ],
        },
      ],
    },
    hint: "Чи вважаєте ви цю проблему вирішеною.",
  },
  {
    name: "Resolved Date",
    type: PropertyType.DATE,
    position: 7,
    icon: "icon:CalendarCheck",
    config: DATE_CONFIG,
    hint: "Дата, після якої помилка більше не повторювалася.",
  },
  {
    name: "Severity",
    type: PropertyType.FORMULA,
    position: 8,
    config: {
      type: "CUSTOM",
      expression:
        "IF(COUNT({{Trading Journal}}) + COUNT({{Daily Routines}}) > 5, 'High', IF(COUNT({{Trading Journal}}) + COUNT({{Daily Routines}}) > 2, 'Medium', 'Low'))",
      resultType: "TEXT",
    },
    hint: "Рівень небезпеки помилки на основі загальної частоти рецидивів.",
  },
  {
    name: "Recurrence Count",
    type: PropertyType.FORMULA,
    position: 9,
    config: {
      type: "CUSTOM",
      expression: "COUNT({{Trading Journal}}) + COUNT({{Daily Routines}})",
      resultType: "NUMBER",
    },
    hint: "Загальна кількість задокументованих рецидивів з усіх джерел.",
  },
  {
    name: "Total Cost",
    type: PropertyType.FORMULA,
    position: 10,
    config: {
      type: "CUSTOM",
      expression: "ABS(SUM(MAP({{Trading Journal}}, '{{trading-journal.Net P&L}}')))",
      resultType: "NUMBER",
    },
    hint: "Об'єктивна фінансова шкода, яку помилка нанесла балансу.",
  },
  {
    name: "Last Used",
    type: PropertyType.FORMULA,
    position: 11,
    config: {
      type: "CUSTOM",
      expression: "MAX(MAP({{Trading Journal}}, '{{trading-journal.Entry Date}}'))",
      resultType: "DATE",
    },
    hint: "Дата останнього повторення.",
  },
  {
    name: "Trading Journal",
    type: PropertyType.RELATION,
    position: 12,
    config: { sourceDatabaseType: "trading-journal", multiple: true, reversePropertyName: "Mistakes" },
    hint: "Усі угоди, які постраждали від цієї помилки.",
  },
  {
    name: "Daily Routines",
    type: PropertyType.RELATION,
    position: 13,
    config: { sourceDatabaseType: "daily-routine", multiple: true },
    hint: "Дні, коли ця помилка повторювалася.",
  },
];
