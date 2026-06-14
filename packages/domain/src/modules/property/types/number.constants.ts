export const NUMBER_FORMAT_VALUES = ["integer", "float", "currency", "percentage"] as const;
export type NumberFormat = (typeof NUMBER_FORMAT_VALUES)[number];

export const DEFAULT_NUMBER_PROPERTY = {
  defaultValue: 0,
  format: "float" as NumberFormat,
  decimalPlaces: 2,
  currencySymbol: "",
  prefix: "",
  suffix: "",
};
