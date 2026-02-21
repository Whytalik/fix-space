export interface NumberProperty {
  defaultValue: number;
  format: 'integer' | 'float' | 'currency' | 'percentage';
  decimalPlaces?: number;
  currencySymbol?: string;
}

export const DEFAULT_NUMBER_PROPERTY = {
  defaultValue: 0,
  format: 'float',
  decimalPlaces: 2,
  currencySymbol: '$',
} satisfies NumberProperty;
