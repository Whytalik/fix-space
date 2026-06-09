import { PropertyType } from "@fixspace/domain";
import { DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const routineLibraryProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Назва вашого чеклиста або ритуалу.",
    group: "General",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    config: DATE_CONFIG,
    hint: "Дата останнього перегляду або оновлення правил рутини.",
    group: "General",
  },
  {
    name: "Sleep Quality",
    type: PropertyType.RATING,
    position: 2,
    hint: "Якість сну критично впливає на дисципліну та тильт.",
    group: "Metrics",
  },
  {
    name: "Pre-Market State",
    type: PropertyType.SELECT,
    position: 3,
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Emotions",
          options: [
            { value: "Calm", color: "#16A34A" },
            { value: "Anxious", color: "#D97706" },
            { value: "FOMO", color: "#DB2777" },
            { value: "Greed", color: "#CA8A04" },
            { value: "Fear", color: "#DC2626" },
            { value: "Revenge", color: "#92400E" },
            { value: "Bored", color: "#6B7280" },
            { value: "Overconfident", color: "#7C3AED" },
          ],
        },
      ],
    },
    hint: "Ваш ментальний стан перед торгівлею.",
    group: "Psychology",
  },
  {
    name: "Post-Market State",
    type: PropertyType.SELECT,
    position: 4,
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Emotions",
          options: [
            { value: "Calm", color: "#16A34A" },
            { value: "Anxious", color: "#D97706" },
            { value: "FOMO", color: "#DB2777" },
            { value: "Greed", color: "#CA8A04" },
            { value: "Fear", color: "#DC2626" },
            { value: "Revenge", color: "#92400E" },
            { value: "Bored", color: "#6B7280" },
            { value: "Overconfident", color: "#7C3AED" },
          ],
        },
      ],
    },
    hint: "Емоційний результат після сесії.",
    group: "Psychology",
  },
  {
    name: "Plan Adherence",
    type: PropertyType.RATING,
    position: 5,
    hint: "Ваша загальна оцінка дисципліни за день.",
    group: "Psychology",
  },
  {
    name: "Distractions",
    type: PropertyType.SELECT,
    position: 6,
    config: {
      isMultiSelect: true,
      categories: [
        {
          label: "Distractions",
          options: [
            { value: "Phone", color: "#DC2626" },
            { value: "Social", color: "#7C3AED" },
          ],
        },
      ],
    },
    hint: "Фактори, що заважали концентрації (дзвінки, соцмережі).",
    group: "Psychology",
  },
  {
    name: "Daily Routines",
    type: PropertyType.RELATION,
    position: 7,
    config: { sourceDatabaseType: "daily-routine", multiple: true },
    hint: "Пов'язані сесії, де використовувався цей чеклист.",
    group: "Relations",
  },
];
