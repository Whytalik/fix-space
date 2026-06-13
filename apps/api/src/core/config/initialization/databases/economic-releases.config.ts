import { PropertyType } from "@fixspace/domain";
import { DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const economicReleasesProperties: InitPropertyDef[] = [
  {
    name: "Release",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Назва конкретного випуску новини (наприклад, US CPI - May 2026)",
    group: "General",
  },
  {
    name: "Event",
    type: PropertyType.RELATION,
    position: 1,
    config: { sourceDatabaseType: "economic-events", multiple: false },
    hint: "Посилання на макроекономічну подію",
    group: "General",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 2,
    config: DATE_CONFIG,
    hint: "Дата та час публікації новини",
    group: "General",
  },
  {
    name: "Forecast",
    type: PropertyType.TEXT,
    position: 3,
    hint: "Прогнозоване аналітиками значення",
    group: "Metrics",
  },
  {
    name: "Previous",
    type: PropertyType.TEXT,
    position: 4,
    hint: "Попереднє фактичне значення",
    group: "Metrics",
  },
  {
    name: "Actual",
    type: PropertyType.TEXT,
    position: 5,
    hint: "Фактичне значення після публікації",
    group: "Metrics",
  },
  {
    name: "Trading Journal",
    type: PropertyType.RELATION,
    position: 6,
    config: { sourceDatabaseType: "trading-journal", multiple: true },
    hint: "Угоди, відкриті під час або під впливом цієї новини",
    group: "Relations",
  },
  {
    name: "Notes",
    type: PropertyType.TEXT,
    position: 7,
    hint: "Нотатки щодо релізу та реакції ринку",
    group: "General",
  },
];
