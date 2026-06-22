import { PropertyType } from "@fixspace/domain";
import { colors, DATE_CONFIG } from "../constants";
import type { InitPropertyDef } from "../types";

export const operationsProperties: InitPropertyDef[] = [
  {
    name: "Name",
    type: PropertyType.TEXT,
    position: 0,
    hint: "Опис операції для зручної навігації (напр. Deposit #5).",
  },
  {
    name: "Type",
    type: PropertyType.SELECT,
    position: 1,
    icon: "icon:ArrowLeftRight",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Type",
          options: [
            { value: "Deposit", color: colors.green, icon: "icon:ArrowDownToLine" },
            { value: "Withdrawal", color: colors.red, icon: "icon:ArrowUpFromLine" },
            { value: "Fee", color: colors.amber, icon: "icon:Receipt" },
            { value: "Transfer", color: colors.purple, icon: "icon:ArrowLeftRight" },
          ],
        },
      ],
    },
    hint: "Operation type: deposit, withdrawal, fee, or inter-account transfer",
  },
  {
    name: "Status",
    type: PropertyType.SELECT,
    position: 2,
    icon: "icon:List",
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Status",
          options: [
            { value: "Pending", color: colors.amber, icon: "icon:Clock" },
            { value: "Processing", color: colors.blue, icon: "icon:Loader" },
            { value: "Completed", color: colors.green, icon: "icon:CheckCircle2" },
            { value: "Failed", color: colors.red, icon: "icon:XCircle" },
            { value: "Cancelled", color: colors.gray, icon: "icon:Ban" },
          ],
        },
      ],
    },
    hint: "Processing status — important for prop firm withdrawals that take days to settle",
  },
  {
    name: "Date",
    type: PropertyType.DATE,
    position: 3,
    icon: "icon:Calendar",
    config: DATE_CONFIG,
    hint: "Date the operation was initiated",
  },
  {
    name: "Settlement Date",
    type: PropertyType.DATE,
    position: 4,
    icon: "icon:CalendarCheck",
    config: DATE_CONFIG,
    hint: "Date the funds actually arrived or were debited",
  },
  {
    name: "Account",
    type: PropertyType.RELATION,
    position: 5,
    config: { sourceDatabaseType: "accounts", multiple: false },
    hint: "Account this operation belongs to",
  },
  {
    name: "Payment Method",
    type: PropertyType.SELECT,
    position: 6,
    config: {
      isMultiSelect: false,
      categories: [
        {
          label: "Method",
          options: [
            { value: "Bank Wire", color: colors.blue, icon: "icon:Banknote" },
            { value: "SEPA", color: colors.purple, icon: "icon:Landmark" },
            { value: "Crypto", color: colors.amber, icon: "icon:Coins" },
            { value: "PayPal", color: colors.blue, icon: "icon:CreditCard" },
            { value: "Wise", color: colors.green, icon: "icon:Globe" },
            { value: "Internal Transfer", color: colors.gray, icon: "icon:ArrowLeftRight" },
          ],
        },
      ],
    },
    hint: "Payment channel used for this operation",
  },
  {
    name: "Reference",
    type: PropertyType.TEXT,
    position: 7,
    hint: "Transaction ID or broker confirmation number",
  },
  {
    name: "Amount",
    type: PropertyType.NUMBER,
    position: 8,
    icon: "icon:DollarSign",
    config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
    hint: "Gross operation amount",
  },
  {
    name: "Fee",
    type: PropertyType.NUMBER,
    position: 9,
    icon: "icon:Receipt",
    config: { defaultValue: 0, format: "currency", currencySymbol: "$", decimalPlaces: 2 },
    hint: "Processing, transfer, or platform fee",
  },
  {
    name: "Net Amount",
    type: PropertyType.FORMULA,
    position: 10,
    config: {
      type: "CUSTOM",
      expression: "IF(IS_EMPTY({{Fee}}), {{Amount}}, {{Amount}} - {{Fee}})",
      resultType: "NUMBER",
    },
    hint: "Actual funds received or sent after fees",
  },
  {
    name: "Notes",
    type: PropertyType.TEXT,
    position: 11,
    icon: "icon:FileText",
  },
];
