import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG, PAIR_CATEGORIES } from "../constants";
import type { InitPropertyDef } from "../types";

export const notesProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Короткий заголовок, що відображає суть інсайту або уроку.",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    icon: "icon:Calendar",
    config: DATE_CONFIG,
    hint: "Дата фіксації ідеї. Допомагає відстежувати вашу еволюцію.",
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
          label: "Topics",
          options: [
            { value: "Strategy", color: colors.blue },
            { value: "Analysis", color: colors.purple },
            { value: "Execution", color: colors.amber },
            { value: "Risk Management", color: colors.green },
            { value: "Rules", color: colors.pink },
            { value: "Psychology", color: colors.red },
          ],
        },
      ],
    },
    hint: "Тема нотатки для зручної фільтрації та повторення.",
  },
  {
    name: "Status",
    type: PropertyType.SELECT,
    position: 3,
    icon: "icon:List",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Status",
          options: [
            { value: "Draft", color: colors.gray },
            { value: "Active", color: colors.blue },
            { value: "Archived", color: colors.amber },
          ],
        },
      ],
    },
    hint: "Актуальність нотатки. Draft — незавершена думка, Active — діюче правило, Archived — застаріле.",
  },
  {
    name: "Confidence",
    type: PropertyType.SELECT,
    position: 4,
    icon: "icon:TrendingUp",
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
  },
  {
    name: "Source",
    type: PropertyType.SELECT,
    position: 5,
    icon: "icon:BookMarked",
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Source",
          options: [
            { value: "Trade Loss", color: colors.red },
            { value: "Trade Win", color: colors.green },
            { value: "Book", color: colors.blue },
            { value: "Video", color: colors.purple },
            { value: "Course", color: colors.pink },
            { value: "Mentor", color: colors.gold },
            { value: "Research", color: colors.amber },
            { value: "Community", color: colors.brown },
            { value: "Backtest", color: colors.gray },
            { value: "Journal Review", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Звідки ви взяли цей інсайт (помилка, книга, ментор, курс тощо).",
  },
  {
    name: "Market Regime",
    type: PropertyType.SELECT,
    position: 6,
    icon: "icon:ChartLine",
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
  },
  {
    name: "Rating",
    type: PropertyType.RATING,
    position: 7,
    icon: "icon:Star",
    config: { maxStars: 5, allowHalf: true },
    hint: "Важливість інсайту від 1 до 5. Допомагає пріоритизувати повторення.",
  },
  {
    name: "Pair",
    type: PropertyType.SELECT,
    position: 8,
    icon: "icon:TrendingUp",
    config: {
      isMultiSelect: true,
      categories: PAIR_CATEGORIES,
    },
    hint: "Інструмент(и), до яких застосовується цей інсайт.",
  },
  {
    name: "Times Applied",
    type: PropertyType.FORMULA,
    position: 9,
    config: {
      type: "CUSTOM",
      expression: "COUNT({{Trading Journal}})",
      resultType: "NUMBER",
    },
    hint: "Кількість угод, у яких цей інсайт був застосований.",
  },
  {
    name: "Last Used",
    type: PropertyType.FORMULA,
    position: 10,
    config: {
      type: "CUSTOM",
      expression: "MAX(MAP({{Trading Journal}}, '{{trading-journal.Entry Date}}'))",
      resultType: "DATE",
    },
    hint: "Дата, коли ви востаннє посилалися на цей інсайт в угодах.",
  },
  {
    name: "Trading Journal",
    type: PropertyType.RELATION,
    position: 11,
    config: { sourceDatabaseType: "trading-journal", multiple: true, reversePropertyName: "Notes" },
    hint: "Угоди, у яких цей інсайт був застосований або помічений.",
  },
  {
    name: "Mistakes",
    type: PropertyType.RELATION,
    position: 12,
    config: { sourceDatabaseType: "mistakes", multiple: true },
    hint: "Помилки, що породили або підкріплюють цей інсайт.",
  },
  {
    name: "Daily Routines",
    type: PropertyType.RELATION,
    position: 14,
    config: { sourceDatabaseType: "daily-routine", multiple: true },
    hint: "Сесії, під час яких з'явилася ця нотатка.",
  },
];
