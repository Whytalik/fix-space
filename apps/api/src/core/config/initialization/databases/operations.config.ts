import { PropertyType } from "@fixspace/domain";
import { DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const operationsProperties: InitPropertyDef[] = [
  { name: "Name", type: PropertyType.TEXT, isRequired: true, position: 0, hint: "Operation name or description" },
  {
    name: "Type",
    type: PropertyType.SELECT,
    position: 1,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Type",
          options: [
            { value: "Deposit", color: "#16A34A", icon: "icon:ArrowDownToLine" },
            { value: "Withdrawal", color: "#DC2626", icon: "icon:ArrowUpFromLine" },
          ],
        },
      ],
    },
    hint: "Operation type: deposit or withdrawal",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 2,
    config: DATE_CONFIG,
    hint: "Date the operation was processed",
  },
  {
    name: "Account",
    type: PropertyType.RELATION,
    position: 3,
    config: { sourceDatabaseType: "accounts", multiple: false },
    hint: "Account this operation belongs to",
  },
  {
    name: "Amount",
    type: PropertyType.NUMBER,
    position: 4,
    config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
    hint: "Operation amount in USD",
  },
];
