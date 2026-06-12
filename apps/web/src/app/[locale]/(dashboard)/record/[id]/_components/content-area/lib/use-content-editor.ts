"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ContentComponentData, ContentSchema } from "@fixspace/domain";
import type { ContentComponentType } from "@fixspace/domain";
import {
  addColumn,
  addComponent,
  addRow,
  addRowWithColumns,
  changeComponentType,
  deleteColumn,
  deleteComponent,
  deleteRow,
  moveContentItem,
  moveRow,
  setColumnWidths,
  updateComponentData,
} from "./content-tree";

const DEBOUNCE_MS = 700;

interface UseContentEditorOptions {
  initialContent: ContentSchema | undefined;
  isLoading: boolean;
  onSave: (content: ContentSchema) => void;
}

export function useContentEditor({ initialContent, isLoading, onSave }: UseContentEditorOptions) {
  const [content, setContent] = useState<ContentSchema>({ rows: [] });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const scheduleSave = useCallback((next: ContentSchema) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSaveRef.current(next);
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const apply = useCallback(
    (next: ContentSchema) => {
      setContent(next);
      scheduleSave(next);
    },
    [scheduleSave],
  );

  return {
    content,
    isLoading,
    onAddRow: () => apply(addRow(content)),
    onDeleteRow: (rowId: string) => apply(deleteRow(content, rowId)),
    onMoveRow: (fromIndex: number, toIndex: number) => apply(moveRow(content, fromIndex, toIndex)),
    onAddColumn: (rowId: string) => apply(addColumn(content, rowId)),
    onDeleteColumn: (rowId: string, columnId: string) => apply(deleteColumn(content, rowId, columnId)),
    onSetColumnWidths: (rowId: string, widths: number[]) => apply(setColumnWidths(content, rowId, widths)),
    onAddRowWithColumns: (columnCount: 1 | 2 | 3 | 4 | 5, insertIndex?: number) =>
      apply(addRowWithColumns(content, columnCount, insertIndex)),
    onAddComponent: (rowId: string, columnId: string, type: ContentComponentType, overId?: string) =>
      apply(addComponent(content, rowId, columnId, type, overId)),
    onDeleteComponent: (componentId: string) => apply(deleteComponent(content, componentId)),
    onUpdateComponentData: (componentId: string, data: ContentComponentData) => apply(updateComponentData(content, componentId, data)),
    onChangeComponentType: (componentId: string, newType: ContentComponentType) =>
      apply(changeComponentType(content, componentId, newType)),
    onMoveContentItem: (
      activeId: string,
      overId: string,
      source: { rowId?: string; columnId?: string },
      target: { rowId?: string; columnId?: string },
    ) => apply(moveContentItem(content, activeId, overId, source.rowId, source.columnId, target.rowId, target.columnId)),
  };
}

export type ContentEditorState = ReturnType<typeof useContentEditor>;
