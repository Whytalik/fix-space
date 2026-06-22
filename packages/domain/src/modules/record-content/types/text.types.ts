export type TextAlignment = "left" | "center" | "right" | "justify";

export interface TextComponentData {
  html: string;
  align?: TextAlignment;
}
