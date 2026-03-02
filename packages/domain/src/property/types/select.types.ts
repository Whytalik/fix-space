export interface SelectCategory {
  label: string;
  options: string[];
}

export interface SelectProperty {
  isMultiSelect: boolean;
  categories: SelectCategory[];
}

export const DEFAULT_SELECT_PROPERTY = {
  isMultiSelect: false,
  categories: [],
} satisfies SelectProperty;
