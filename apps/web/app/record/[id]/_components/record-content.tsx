"use client";

import { ContentRenderer } from "@/components/content/content-renderer";
import { Button } from "@/components/ui/primitives/button";
import { Spinner } from "@/components/ui/primitives/spinner";
import { getRecordContent, updateRecordContent } from "@/lib/api/record";
import { BlockType } from "@nucleus/domain";
import type { ContainerBlock, ContentNode } from "@nucleus/domain";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type RecordContentProps = {
  recordId: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

function makeEmptyRoot(): ContainerBlock {
  return {
    id: crypto.randomUUID(),
    type: BlockType.ROW,
    columns: 1,
    children: [],
  };
}

function makeNewRow(): ContainerBlock {
  const col: ContainerBlock = {
    id: crypto.randomUUID(),
    type: BlockType.COLUMN,
    children: [],
  };
  return {
    id: crypto.randomUUID(),
    type: BlockType.ROW,
    columns: 1,
    children: [col],
  };
}

function isEmptyObject(val: unknown): boolean {
  return val !== null && typeof val === "object" && !Array.isArray(val) && Object.keys(val as object).length === 0;
}

export function RecordContent({ recordId }: RecordContentProps) {
  const [content, setContent] = useState<ContainerBlock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef<ContainerBlock | null>(null);

  const persistContent = useCallback(
    async (toSave: ContainerBlock) => {
      setSaveStatus("saving");
      try {
        await updateRecordContent(recordId, toSave);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [recordId],
  );

  const scheduleSave = useCallback(
    (next: ContainerBlock) => {
      latestContentRef.current = next;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (latestContentRef.current) {
          persistContent(latestContentRef.current);
        }
      }, 800);
    },
    [persistContent],
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getRecordContent(recordId)
      .then((res) => {
        if (cancelled) return;
        const raw = res.content;
        if (!raw || isEmptyObject(raw)) {
          setContent(makeEmptyRoot());
        } else {
          setContent(raw as ContainerBlock);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setContent(makeEmptyRoot());
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleRowChange(index: number, updated: ContentNode) {
    if (!content) return;
    const children = [...content.children];
    children[index] = updated;
    const next = { ...content, children };
    setContent(next);
    scheduleSave(next);
  }

  function handleRowDelete(index: number) {
    if (!content) return;
    const children = content.children.filter((_, i) => i !== index);
    const next = { ...content, children };
    setContent(next);
    scheduleSave(next);
  }

  function handleAddRow() {
    if (!content) return;
    const newRow = makeNewRow();
    const next = { ...content, children: [...content.children, newRow] };
    setContent(next);
    scheduleSave(next);
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (!content) return null;

  const rows = content.children as ContainerBlock[];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3 min-h-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Content</span>
        {saveStatus === "saving" && (
          <span className="text-xs text-ink-muted flex items-center gap-1.5">
            <Spinner size="sm" />
            Saving…
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="text-xs text-ink-muted">Saved</span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs text-error">Save failed</span>
        )}
      </div>

      <div className="border border-stroke rounded-xl bg-surface p-4 flex flex-col gap-6">
        {rows.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-4 select-none">
            No content yet. Add a row to start.
          </p>
        )}

        {rows.map((row, index) => (
          <div key={row.id} className="relative pt-8">
            <ContentRenderer
              node={row}
              onChange={(updated) => handleRowChange(index, updated)}
              onDelete={() => handleRowDelete(index)}
            />
          </div>
        ))}

        <div className="flex justify-center pt-1 border-t border-stroke-subtle">
          <Button variant="ghost" size="sm" onClick={handleAddRow} className="gap-1.5 text-ink-muted">
            <Plus size={13} />
            Add row
          </Button>
        </div>
      </div>
    </div>
  );
}
