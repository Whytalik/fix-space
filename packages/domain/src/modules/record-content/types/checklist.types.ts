export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistComponentData {
  items: ChecklistItem[];
  showProgress?: boolean;
}
