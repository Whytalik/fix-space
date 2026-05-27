"use client";

import { Button } from "@/components/ui/primitives/button";
import { TabSwitcher } from "@/components/ui/primitives/tab-switcher";
import type { TabItem } from "@/components/ui/primitives/tab-switcher";
import { Blocks, Columns3, LayoutTemplate, Plus } from "lucide-react";
import { useState } from "react";

type EditorTab = "columns" | "components" | "blocks";

const TAB_ITEMS: TabItem<EditorTab>[] = [
  { id: "columns", label: "Columns", icon: Columns3 },
  { id: "components", label: "Components", icon: LayoutTemplate },
  { id: "blocks", label: "Blocks", icon: Blocks },
];

type ColumnCount = 1 | 2 | 3;

const COLUMN_OPTIONS: { count: ColumnCount; label: string }[] = [
  { count: 1, label: "1 column" },
  { count: 2, label: "2 columns" },
  { count: 3, label: "3 columns" },
];

function ColumnVisual({ count }: { count: ColumnCount }) {
  return (
    <div className="flex gap-1 w-full h-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1 rounded" style={{ background: "var(--color-stroke)" }} />
      ))}
    </div>
  );
}

function ColumnsTabContent() {
  const [selectedColumns, setSelectedColumns] = useState<ColumnCount>(1);

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-ink-muted)" }}>
        Layout
      </p>

      <div className="flex flex-col gap-2">
        {COLUMN_OPTIONS.map(({ count, label }) => {
          const isActive = selectedColumns === count;
          return (
            <button
              key={count}
              type="button"
              onClick={() => setSelectedColumns(count)}
              className="flex flex-col gap-2 p-3 rounded-xl border transition-colors duration-150 text-left"
              style={{
                background: isActive ? "var(--color-accent-muted)" : "var(--color-surface)",
                borderColor: isActive ? "var(--color-accent)" : "var(--color-stroke)",
                color: isActive ? "var(--color-accent)" : "var(--color-ink-secondary)",
              }}
            >
              <ColumnVisual count={count} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      <Button variant="secondary" className="w-full justify-center">
        <Plus size={14} />
        Add Row
      </Button>
    </div>
  );
}

function ComponentsTabContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <LayoutTemplate size={28} style={{ color: "var(--color-ink-muted)" }} />
      <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
        Components coming soon
      </p>
    </div>
  );
}

function BlocksTabContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
      <Blocks size={28} style={{ color: "var(--color-ink-muted)" }} />
      <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
        Blocks coming soon
      </p>
    </div>
  );
}

export default function RecordEditPage() {
  const [activeTab, setActiveTab] = useState<EditorTab>("columns");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-canvas)" }}>
      {/* Left sidebar — tabs panel */}
      <aside
        className="flex flex-col shrink-0 w-80"
        style={{
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-stroke)",
        }}
      >
        <div className="p-3 border-b" style={{ borderColor: "var(--color-stroke)" }}>
          <TabSwitcher<EditorTab> items={TAB_ITEMS} active={activeTab} onChange={setActiveTab} orientation="vertical" />
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === "columns" && <ColumnsTabContent />}
          {activeTab === "components" && <ComponentsTabContent />}
          {activeTab === "blocks" && <BlocksTabContent />}
        </div>
      </aside>

      {/* Main canvas */}
      <main className="flex flex-col flex-1 overflow-auto">
        {/* Canvas body */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="rounded-xl border p-8 w-full max-w-2xl text-center"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-stroke)",
              color: "var(--color-ink-muted)",
            }}
          >
            <LayoutTemplate size={32} className="mx-auto mb-3" style={{ color: "var(--color-ink-muted)" }} />
            <p className="text-sm">Content editor canvas</p>
          </div>
        </div>
      </main>

      {/* Right sidebar — settings panel */}
      <aside
        className="flex flex-col shrink-0 w-80"
        style={{
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-stroke)",
        }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-stroke)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-ink-muted)" }}>
            Settings
          </p>
        </div>
        <div className="flex-1 px-4 py-4">
          <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
            Select a column, component, or block to see its settings.
          </p>
        </div>
      </aside>
    </div>
  );
}
