"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LayoutGrid, Component, ChevronDown, ChevronRight } from "lucide-react";
import type { ContentComponentType } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";

interface StructureTabProps {
  editor: ContentEditorState;
  onSelectRow: (id: string) => void;
  onSelectColumn: (rowId: string, colId: string) => void;
  onSelectComponent: (id: string, type: ContentComponentType) => void;
  selectedId?: string;
}

export function StructureTab({ editor, onSelectRow, onSelectColumn, onSelectComponent, selectedId }: StructureTabProps) {
  const t = useTranslations("RecordPage.structure");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedId) return;

    setExpandedIds((prev) => {
      const newExpanded = new Set(prev);
      let found = false;

      for (const row of editor.content.rows) {
        if (row.id === selectedId) {
          found = true;
          break;
        }
        for (const column of row.columns) {
          if (column.id === selectedId) {
            newExpanded.add(row.id);
            found = true;
            break;
          }
          const inColumn = column.children.some((child) => child.id === selectedId);
          if (inColumn) {
            newExpanded.add(row.id);
            newExpanded.add(column.id);
            found = true;
            break;
          }
        }
        if (found) break;
      }

      return found ? newExpanded : prev;
    });
  }, [selectedId, editor.content.rows]);

  const toggleExpand = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-0.5">
      {editor.content.rows.map((row, rowIndex) => {
        const isRowExpanded = expandedIds.has(row.id);
        return (
          <div key={row.id} className="flex flex-col gap-0.5">
            <button
              onClick={() => onSelectRow(row.id)}
              className={`w-full group flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 ${selectedId === row.id ? "bg-accent/10 text-accent font-semibold" : "text-ink hover:bg-surface-hover"}`}
            >
              <span onClick={(event) => toggleExpand(event, row.id)} className="p-0.5 hover:bg-hover rounded text-ink-muted">
                {isRowExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
              <LayoutGrid size={12} className="shrink-0 opacity-50" />
              <span className="truncate">
                {t("row")} {rowIndex + 1}
              </span>
            </button>

            {isRowExpanded && (
              <div className="ml-4 pl-2 border-l border-stroke flex flex-col gap-0.5 mt-0.5 mb-1">
                {row.columns.map((column, columnIndex) => {
                  const isColumnExpanded = expandedIds.has(column.id);
                  const hasChildren = column.children.length > 0;

                  return (
                    <div key={column.id} className="flex flex-col gap-0.5">
                      <button
                        onClick={() => onSelectColumn(row.id, column.id)}
                        className={`w-full group flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 ${selectedId === column.id ? "bg-accent/10 text-accent font-semibold" : "text-ink-secondary hover:text-ink hover:bg-surface-hover"}`}
                      >
                        {hasChildren ? (
                          <span onClick={(event) => toggleExpand(event, column.id)} className="p-0.5 hover:bg-hover rounded text-ink-muted">
                            {isColumnExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                          </span>
                        ) : (
                          <div className="w-4" />
                        )}
                        <div className="w-3 h-3 rounded-sm bg-current opacity-20 shrink-0" />
                        <span className="truncate">
                          {t("column")} {columnIndex + 1}
                        </span>
                      </button>

                      {isColumnExpanded && (
                        <div className="ml-3 border-l border-stroke/50 flex flex-col gap-0.5">
                          {column.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => onSelectComponent(child.id, child.type)}
                              className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors duration-150 ${selectedId === child.id ? "bg-accent/10 text-accent font-semibold" : "text-ink-muted hover:text-ink-secondary hover:bg-surface-hover"}`}
                            >
                              <div className="w-4 shrink-0" />
                              <Component size={10} className="shrink-0 opacity-40" />
                              <span className="truncate">{child.type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {editor.content.rows.length === 0 && <p className="py-8 text-center text-xs text-ink-muted italic">{t("empty")}</p>}
    </div>
  );
}
