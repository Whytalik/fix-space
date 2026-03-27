export interface SelectOption {
  value: string;
  color?: string;
  icon?: string;
}

export interface SelectCategory {
  label: string;
  options: SelectOption[];
}

export interface SelectProperty {
  isMultiSelect: boolean;
  categories: SelectCategory[];
}

export const DEFAULT_SELECT_PROPERTY = {
  isMultiSelect: false,
  categories: [],
} satisfies SelectProperty;
