import type { TextAlignment } from "./text.types";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingComponentData {
  html: string;
  align?: TextAlignment;
  level: HeadingLevel;
}
