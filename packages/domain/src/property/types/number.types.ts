export const NUMBER_FORMAT_VALUES = [
  'integer',
  'float',
  'currency',
  'percentage',
] as const;
export type NumberFormat = (typeof NUMBER_FORMAT_VALUES)[number];

export interface NumberProperty {
  defaultValue: number;
  format: NumberFormat;
  decimalPlaces?: number;
  currencySymbol?: string;
}

export const DEFAULT_NUMBER_PROPERTY = {
  defaultValue: 0,
  format: 'float',
  decimalPlaces: 2,
  currencySymbol: '$',
} satisfies NumberProperty;
