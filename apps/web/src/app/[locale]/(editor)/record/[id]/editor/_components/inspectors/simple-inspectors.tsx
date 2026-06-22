"use client";

import { useTranslations } from "next-intl";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type {
  ImageComponentData,
  TextComponentData,
  HeadingComponentData,
  DividerComponentData,
  ChecklistComponentData,
} from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { Section } from "./section";
import { AlignmentControls } from "./alignment-controls";
import { findComponent } from "./utils";

interface InspectorProps {
  componentId: string;
  editor: ContentEditorState;
}

export function HeadingInspector({ componentId, editor }: InspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { html: "", level: 1 }) as HeadingComponentData;

  return (
    <div className="flex flex-col gap-4">
      <Section label={t("headingLevel")}>
        <div className="grid grid-cols-3 gap-1">
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.onUpdateComponentData(componentId, { ...data, level })}
              className={`py-2 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                (data.level || 1) === level
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-stroke text-ink-muted hover:text-ink-secondary"
              }`}
            >
              H{level}
            </button>
          ))}
        </div>
      </Section>
      <AlignmentControls value={data.align} onChange={(patch) => editor.onUpdateComponentData(componentId, { ...data, ...patch })} />
    </div>
  );
}

export function TextInspector({ componentId, editor }: InspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { html: "" }) as TextComponentData;

  return (
    <div className="flex flex-col gap-3">
      <AlignmentControls value={data.align} onChange={(patch) => editor.onUpdateComponentData(componentId, { ...data, ...patch })} />
      <p className="type-hint text-center">{t("textFormatHint")}</p>
    </div>
  );
}

export function ImageInspector({ componentId, editor }: InspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data ?? { url: "", align: "center" }) as ImageComponentData;

  return (
    <div className="flex flex-col gap-4">
      <Section label={t("imageUrl")}>
        <input
          value={data.url}
          onChange={(event) => editor.onUpdateComponentData(componentId, { ...data, url: event.target.value })}
          placeholder="https://..."
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stroke bg-transparent text-ink focus:outline-none focus:border-accent transition-colors duration-150"
        />
      </Section>
      <Section label={t("alignment")}>
        <div className="flex gap-1">
          {[
            { id: "left", icon: <AlignLeft size={14} /> },
            { id: "center", icon: <AlignCenter size={14} /> },
            { id: "right", icon: <AlignRight size={14} /> },
          ].map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => editor.onUpdateComponentData(componentId, { ...data, align: id as ImageComponentData["align"] })}
              className={`flex-1 py-2 flex items-center justify-center rounded-lg border transition-colors duration-150 ${
                (data.align || "center") === id ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function DividerInspector({ componentId, editor }: InspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || {}) as DividerComponentData;

  return (
    <div className="flex flex-col gap-4">
      <Section label={t("style")}>
        <div className="flex gap-1">
          {[
            { id: "solid", label: "—" },
            { id: "dashed", label: "╌" },
            { id: "dotted", label: "···" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => editor.onUpdateComponentData(componentId, { style: id as DividerComponentData["style"] })}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors duration-150 ${
                (data.style || "solid") === id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-stroke text-ink-muted hover:text-ink-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function ChecklistInspector({ componentId, editor }: InspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { items: [] }) as ChecklistComponentData;

  return (
    <Section label={t("options")}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-secondary">{t("showProgress")}</span>
        <CheckboxInput
          checked={!!data.showProgress}
          onChange={(checked) => editor.onUpdateComponentData(componentId, { ...data, showProgress: checked })}
        />
      </div>
    </Section>
  );
}
