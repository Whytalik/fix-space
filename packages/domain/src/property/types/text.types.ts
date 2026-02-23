export const URL_HANDLING_VALUES = ['none', 'detect', 'preview'] as const;
export type UrlHandling = (typeof URL_HANDLING_VALUES)[number];

export interface TextProperty {
  defaultValue: string;
  isRichText: boolean;
  urlHandling: UrlHandling;
}

export const DEFAULT_TEXT_PROPERTY = {
  defaultValue: '',
  isRichText: false,
  urlHandling: 'none',
} satisfies TextProperty;
