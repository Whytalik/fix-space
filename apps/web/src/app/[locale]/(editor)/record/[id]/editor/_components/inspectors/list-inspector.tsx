"use client";

import { useTranslations } from "next-intl";
import { List, ListOrdered, ToggleLeft } from "lucide-react";
import type { ListComponentData } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { Section } from "./section";
import { findComponent } from "./utils";

interface ListInspectorProps {
  componentId: string;
  editor: ContentEditorState;
}

export function ListInspector({ componentId, editor }: ListInspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { items: [], listType: "bullet" }) as ListComponentData;
  const listType = data.listType || "bullet";

  return (
    <Section label={t("listType")}>
      <div className="flex gap-1">
        {(
          [
            { id: "bullet", icon: <List size={14} /> },
            { id: "numbered", icon: <ListOrdered size={14} /> },
            { id: "toggle", icon: <ToggleLeft size={14} /> },
          ] as const
        ).map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => editor.onUpdateComponentData(componentId, { ...data, listType: id })}
            className={`flex-1 py-2 flex items-center justify-center rounded-lg border transition-colors duration-150 ${
              listType === id ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </Section>
  );
}
