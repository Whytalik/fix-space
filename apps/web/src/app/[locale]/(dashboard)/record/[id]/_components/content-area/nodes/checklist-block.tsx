"use client";

import { useTranslations } from "next-intl";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import type { ChecklistComponentData } from "@fixspace/domain";

interface ChecklistComponentProps {
  data: ChecklistComponentData;
  isEditing?: boolean;
  onUpdate: (data: ChecklistComponentData) => void;
}

export function ChecklistComponent({ data, onUpdate }: ChecklistComponentProps) {
  const t = useTranslations("RecordPage.canvas");
  const items = data.items || [];

  const handleCheck = (itemId: string, checked: boolean) => {
    const nextItems = items.map((item) => (item.id === itemId ? { ...item, checked } : item));
    onUpdate({ ...data, items: nextItems });
  };

  const handleTextChange = (itemId: string, text: string) => {
    const nextItems = items.map((item) => (item.id === itemId ? { ...item, text } : item));
    onUpdate({ ...data, items: nextItems });
  };

  const handleKeyDown = (itemId: string, index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newItemId = crypto.randomUUID();
      const nextItems = [...items];
      nextItems.splice(index + 1, 0, { id: newItemId, text: "", checked: false });
      onUpdate({ ...data, items: nextItems });
      setTimeout(() => {
        const el = document.getElementById(`chk-${newItemId}`);
        el?.focus();
      }, 30);
    } else if (e.key === "Backspace" && items[index]?.text === "") {
      if (items.length > 1) {
        e.preventDefault();
        const nextItems = items.filter((item) => item.id !== itemId);
        onUpdate({ ...data, items: nextItems });
        const prevItem = items[index - 1];
        if (prevItem) {
          setTimeout(() => {
            const el = document.getElementById(`chk-${prevItem.id}`);
            el?.focus();
          }, 30);
        }
      }
    }
  };

  const addItem = () => {
    const newItemId = crypto.randomUUID();
    onUpdate({
      ...data,
      items: [...items, { id: newItemId, text: "", checked: false }],
    });
    setTimeout(() => {
      const el = document.getElementById(`chk-${newItemId}`);
      el?.focus();
    }, 30);
  };

  const deleteItem = (itemId: string) => {
    if (items.length > 1) {
      onUpdate({
        ...data,
        items: items.filter((item) => item.id !== itemId),
      });
    }
  };

  const completed = items.filter((i) => i.checked).length;
  const total = items.length;

  return (
    <div className="flex flex-col gap-1.5 py-1">
      {data.showProgress && total > 0 && (
        <div className="mb-2">
          <div className="flex justify-between type-hint font-medium mb-1">
            <span>{t("progress")}</span>
            <span>
              {completed}/{total}
            </span>
          </div>
          <div className="h-1.5 bg-stroke rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${(completed / total) * 100}%` }} />
          </div>
        </div>
      )}
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2 group/chk">
          <CheckboxInput checked={item.checked} onChange={(checked) => handleCheck(item.id, checked)} />
          <input
            id={`chk-${item.id}`}
            type="text"
            value={item.text}
            onChange={(e) => handleTextChange(item.id, e.target.value)}
            onKeyDown={(e) => handleKeyDown(item.id, index, e)}
            readOnly={false}
            placeholder={t("todoItem")}
            className={`flex-1 text-sm bg-transparent border-none outline-none text-ink placeholder:text-ink-muted/50 ${item.checked ? "line-through text-ink-muted" : ""}`}
          />
          {items.length > 1 && (
            <button
              onClick={() => deleteItem(item.id)}
              className="opacity-0 group-hover/chk:opacity-100 p-1 hover:bg-surface-hover rounded text-ink-muted hover:text-error transition-all duration-150"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-left text-xs text-ink-muted hover:text-accent font-medium transition-colors duration-150 mt-1 flex items-center gap-1 self-start"
      >
        {t("addItem")}
      </button>
    </div>
  );
}
