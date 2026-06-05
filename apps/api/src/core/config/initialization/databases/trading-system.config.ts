import { PropertyType } from "@fixspace/domain";
import { DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const tradingSystemProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    isRequired: true,
    position: 0,
    hint: "Trading system or strategy name",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 1,
    config: DATE_CONFIG,
    hint: "Date the system was created or last updated",
  },
];
