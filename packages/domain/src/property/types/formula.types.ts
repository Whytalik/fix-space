export const FORMULA_OUTPUT_TYPE_VALUES = [
  'text',
  'number',
  'checkbox',
  'date',
  'relation',
] as const;
export type FormulaOutputType = (typeof FORMULA_OUTPUT_TYPE_VALUES)[number];

export type FormulaOutput =
  | { type: 'text' }
  | { type: 'number' }
  | { type: 'checkbox' }
  | { type: 'date' }
  | { type: 'relation'; relatedEntityId: string; multiple: boolean };

export interface FormulaProperty {
  formula: string;
  output: FormulaOutput;
}

export const DEFAULT_FORMULA_PROPERTY = {
  formula: '',
  output: { type: 'text' },
} satisfies FormulaProperty;
