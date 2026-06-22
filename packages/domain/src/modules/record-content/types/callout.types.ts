export type CalloutType = "info" | "warning" | "success" | "danger" | "custom";

export interface CalloutComponentData {
  title?: string;
  html: string;
  type: CalloutType;
  icon?: string;
  color?: string;
}
