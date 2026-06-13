import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const learningTasksProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Назва завдання, книги, курсу чи теми дослідження",
    group: "General",
  },
  {
    name: "Category",
    type: PropertyType.SELECT,
    position: 1,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Category",
          options: [
            { value: "Book", color: colors.blue },
            { value: "Course", color: colors.purple },
            { value: "Video", color: colors.amber },
            { value: "Task", color: colors.green },
            { value: "Research", color: colors.pink },
          ],
        },
      ],
    },
    hint: "Тип активності або навчального матеріалу",
    group: "General",
  },
  {
    name: "Status",
    type: PropertyType.STATUS,
    position: 2,
    config: {
      defaultOption: "Not started",
      categories: [
        {
          category: "todo",
          defaultOption: "Not started",
          options: [
            { name: "Not started", color: "#6B7280" },
            { name: "Blocked", color: "#DC2626" },
          ],
        },
        {
          category: "in_progress",
          defaultOption: "In progress",
          options: [
            { name: "In review", color: "#D97706" },
            { name: "In progress", color: "#2563EB" },
          ],
        },
        {
          category: "complete",
          defaultOption: "Done",
          options: [
            { name: "Done", color: "#16A34A" },
            { name: "Cancelled", color: "#92400E" },
          ],
        },
      ],
    },
    hint: "Поточний стан виконання",
    group: "General",
  },
  {
    name: "Priority",
    type: PropertyType.SELECT,
    position: 3,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Priority",
          options: [
            { value: "High", color: colors.red },
            { value: "Medium", color: colors.amber },
            { value: "Low", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Пріоритет виконання завдання",
    group: "General",
  },
  {
    name: "Due Date",
    type: PropertyType.DATE,
    position: 4,
    config: DATE_CONFIG,
    hint: "Термін виконання або завершення",
    group: "General",
  },
  {
    name: "Progress %",
    type: PropertyType.PROGRESS,
    position: 5,
    config: {
      defaultValue: 0,
      minValue: 0,
      maxValue: 100,
      step: 1,
      showLabel: true,
      thresholds: [],
    },
    hint: "Відсоток виконання або вивчення матеріалу",
    group: "General",
  },
  {
    name: "Rating",
    type: PropertyType.RATING,
    position: 6,
    hint: "Оцінка корисності матеріалу або результату завдання",
    group: "General",
  },
  {
    name: "Notes",
    type: PropertyType.RELATION,
    position: 7,
    config: { sourceDatabaseType: "notes", multiple: true },
    hint: "Нотатки чи інсайти, пов'язані з цим завданням або матеріалом",
    group: "Relations",
  },
  {
    name: "Trading Journal",
    type: PropertyType.RELATION,
    position: 8,
    config: { sourceDatabaseType: "trading-journal", multiple: true },
    hint: "Угоди, до яких відноситься це завдання або дослідження",
    group: "Relations",
  },
];
