export interface SelectProperty {
  isMultiSelect: boolean;
  options: string[];
}

export const DEFAULT_SELECT_PROPERTY = {
  isMultiSelect: false,
  options: [],
} satisfies SelectProperty;
