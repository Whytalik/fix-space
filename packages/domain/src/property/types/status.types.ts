export const STATUS_CATEGORY_VALUES = ['todo', 'in_progress', 'complete'] as const;
export type StatusCategory = (typeof STATUS_CATEGORY_VALUES)[number];

export const STATUS_OPTION_COLOR_VALUES = [
  '#6B7280',
  '#92400E',
  '#D97706',
  '#CA8A04',
  '#16A34A',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
] as const;
export type StatusOptionColor = (typeof STATUS_OPTION_COLOR_VALUES)[number];

export interface StatusOption {
  name: string;
  color: StatusOptionColor;
}

export interface StatusCategoryConfig {
  category: StatusCategory;
  defaultOption: string;
  options: StatusOption[];
}

export interface StatusProperty {
  defaultOption: string;
  categories: StatusCategoryConfig[];
}

export const DEFAULT_STATUS_PROPERTY = {
  defaultOption: 'Not started',
  categories: [
    {
      category: 'todo',
      defaultOption: 'Not started',
      options: [
        { name: 'Not started', color: '#6B7280' },
        { name: 'Blocked', color: '#DC2626' },
      ],
    },
    {
      category: 'in_progress',
      defaultOption: 'In progress',
      options: [
        { name: 'In review', color: '#D97706' },
        { name: 'In progress', color: '#2563EB' },
      ],
    },
    {
      category: 'complete',
      defaultOption: 'Done',
      options: [
        { name: 'Done', color: '#16A34A' },
        { name: 'Cancelled', color: '#92400E' },
      ],
    },
  ],
} satisfies StatusProperty;
