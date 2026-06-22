"use client";

import { useTranslations } from "next-intl";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { ListComponentData, ListItem, ListType } from "@fixspace/domain";
import { TextProperty } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/fields/text-property";

interface ListItemRowProps {
  item: ListItem;
  index: number;
  depth: number;
  listType: ListType;
  isEditing?: boolean;
  canDelete: boolean;
  onUpdate: (updated: ListItem) => void;
  onDelete: () => void;
}

function ListItemRow({ item, index, depth, listType, isEditing, canDelete, onUpdate, onDelete }: ListItemRowProps) {
  const t = useTranslations("RecordPage.canvas");
  const children = item.children ?? [];
  const isToggle = listType === "toggle";
  const showChildren = !isToggle || item.expanded;

  const addChild = () => {
    const newChild: ListItem = { id: crypto.randomUUID(), html: "", expanded: false, children: [] };
    onUpdate({ ...item, children: [...children, newChild], ...(isToggle ? { expanded: true } : {}) });
  };

  const updateChild = (childId: string, updated: ListItem) =>
    onUpdate({ ...item, children: children.map((child) => (child.id === childId ? updated : child)) });

  const deleteChild = (childId: string) => onUpdate({ ...item, children: children.filter((child) => child.id !== childId) });

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-1.5 group/li">
        {isToggle ? (
          <button
            type="button"
            onClick={() => onUpdate({ ...item, expanded: !item.expanded })}
            className="mt-[3px] shrink-0 text-ink rounded p-0.5 hover:bg-surface-hover transition-colors duration-150"
          >
            {item.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : listType === "bullet" ? (
          <span className="mt-[5px] shrink-0 text-sm leading-none text-ink">{depth === 0 ? "•" : "◦"}</span>
        ) : (
          <span className="mt-[5px] text-sm shrink-0 font-medium tabular-nums w-5 text-right text-ink leading-none">{index + 1}.</span>
        )}
        <div className="flex-1 min-w-0">
          <TextProperty
            ghost
            value={item.html}
            readOnly={false}
            onChange={(html) => onUpdate({ ...item, html })}
            placeholder={t("listItem")}
            editorClass="text-sm text-ink"
          />
        </div>
        {isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover/li:opacity-100 transition-opacity duration-150 mt-0.5 shrink-0">
            <button
              type="button"
              onClick={addChild}
              title={t("addSubItem")}
              className="p-1 hover:bg-surface-hover rounded text-ink-muted hover:text-accent transition-all duration-150 text-xs font-bold leading-none"
            >
              +
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1 hover:bg-surface-hover rounded text-ink-muted hover:text-error transition-all duration-150"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      {showChildren && children.length > 0 && (
        <div className="ml-5 pl-3 border-l border-stroke/50 flex flex-col gap-0.5 mt-0.5">
          {children.map((child, childIndex) => (
            <ListItemRow
              key={child.id}
              item={child}
              index={childIndex}
              depth={depth + 1}
              listType={listType}
              isEditing={isEditing}
              canDelete={children.length > 1}
              onUpdate={(updated) => updateChild(child.id, updated)}
              onDelete={() => deleteChild(child.id)}
            />
          ))}
          {isEditing && (
            <button
              type="button"
              onClick={addChild}
              className="text-left text-xs text-ink-muted hover:text-accent font-medium transition-colors duration-150 py-0.5 pl-0.5 flex items-center gap-1 self-start"
            >
              {t("addSubItem")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ListComponentProps {
  data: ListComponentData;
  isEditing?: boolean;
  onUpdate: (data: ListComponentData) => void;
}

export function ListComponent({ data, isEditing, onUpdate }: ListComponentProps) {
  const t = useTranslations("RecordPage.canvas");
  const items = data.items || [];
  const listType = data.listType || "bullet";

  const addItem = () => {
    const newId = crypto.randomUUID();
    onUpdate({ ...data, items: [...items, { id: newId, html: "", expanded: false, children: [] }] });
  };

  const updateItem = (itemId: string, updated: ListItem) =>
    onUpdate({ ...data, items: items.map((listItem) => (listItem.id === itemId ? updated : listItem)) });

  const deleteItem = (itemId: string) => {
    if (items.length > 1) {
      onUpdate({ ...data, items: items.filter((listItem) => listItem.id !== itemId) });
    }
  };

  return (
    <div className="flex flex-col gap-1 py-1">
      {items.map((item, index) => (
        <ListItemRow
          key={item.id}
          item={item}
          index={index}
          depth={0}
          listType={listType}
          isEditing={isEditing}
          canDelete={items.length > 1}
          onUpdate={(updated) => updateItem(item.id, updated)}
          onDelete={() => deleteItem(item.id)}
        />
      ))}
      {isEditing && (
        <button
          onClick={addItem}
          className="text-left text-xs text-ink-muted hover:text-accent font-medium transition-colors duration-150 mt-1 flex items-center gap-1 self-start"
        >
          {t("addItem")}
        </button>
      )}
    </div>
  );
}
