export interface TextProperty {
  defaultValue: string;
  isRichText: boolean;
}

export const DEFAULT_TEXT_PROPERTY = {
  defaultValue: '',
  isRichText: false,
} satisfies TextProperty;
