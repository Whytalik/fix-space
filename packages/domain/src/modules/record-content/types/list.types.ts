export type ListType = "bullet" | "numbered" | "toggle";

export interface ListItem {
  id: string;
  html: string;
  expanded?: boolean;
  children?: ListItem[];
}

export interface ListComponentData {
  items: ListItem[];
  listType: ListType;
}
