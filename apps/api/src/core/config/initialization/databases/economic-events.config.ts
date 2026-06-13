import { PropertyType } from "@fixspace/domain";
import { colors } from "../constants";
import type { InitPropertyDef } from "../types";

export const economicEventsProperties: InitPropertyDef[] = [
  {
    name: "Event",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Назва події або макроекономічного показника",
    group: "General",
  },
  {
    name: "Currency",
    type: PropertyType.SELECT,
    position: 1,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Currency",
          options: [
            { value: "USD", color: colors.blue },
            { value: "EUR", color: colors.purple },
            { value: "GBP", color: colors.amber },
            { value: "JPY", color: colors.gray },
            { value: "AUD", color: colors.green },
            { value: "CAD", color: colors.pink },
            { value: "CHF", color: colors.red },
          ],
        },
      ],
    },
    hint: "Валюта, на яку впливає подія",
    group: "General",
  },
  {
    name: "Impact",
    type: PropertyType.SELECT,
    position: 2,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Impact",
          options: [
            { value: "High", color: colors.red },
            { value: "Medium", color: colors.amber },
            { value: "Low", color: colors.gray },
          ],
        },
      ],
    },
    hint: "Рівень очікуваної волатильності",
    group: "General",
  },
  {
    name: "Avoid Trading",
    type: PropertyType.CHECKBOX,
    position: 3,
    hint: "Рекомендація утриматися від входу в ринок",
    group: "General",
  },
  {
    name: "Releases",
    type: PropertyType.RELATION,
    position: 4,
    config: { sourceDatabaseType: "economic-releases", multiple: true },
    hint: "Записи публікацій цієї новини",
    group: "Relations",
  },
];
