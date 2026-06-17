"use client";

import { useTranslations } from "next-intl";
import type { CalloutComponentData } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { IconPickerField } from "@/components/ui/form/icon-picker-field";
import { Section } from "./section";
import { findComponent } from "./utils";

interface CalloutInspectorProps {
  componentId: string;
  editor: ContentEditorState;
}

const CALLOUT_CUSTOM_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
  { value: "#0ea5e9", label: "Sky" },
];

export function CalloutInspector({ componentId, editor }: CalloutInspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const component = findComponent(editor.content, componentId);
  const data = (component?.data || { html: "", type: "info", icon: "" }) as CalloutComponentData;
  const type = data.type || "info";

  return (
    <div className="flex flex-col gap-4">
      <Section label={t("type")}>
        <div className="grid grid-cols-2 gap-1.5">
          {(["info", "warning", "success", "danger", "custom"] as const).map((calloutType) => (
            <button
              key={calloutType}
              type="button"
              onClick={() => editor.onUpdateComponentData(componentId, { ...data, type: calloutType })}
              className={`py-2 text-xs font-semibold rounded-lg border transition-all duration-150 capitalize
                ${
                  type === calloutType
                    ? "border-accent bg-accent/10 text-accent font-bold"
                    : "border-stroke text-ink-muted hover:text-ink-secondary"
                }`}
            >
              {calloutType}
            </button>
          ))}
        </div>
      </Section>
      {type === "custom" && (
        <>
          <Section label={t("icon")}>
            <IconPickerField
              value={data.icon}
              onChange={(icon) => editor.onUpdateComponentData(componentId, { ...data, icon })}
              placeholder={t("chooseIcon")}
            />
          </Section>
          <Section label={t("color")}>
            <div className="flex flex-wrap gap-1.5">
              {CALLOUT_CUSTOM_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  title={label}
                  type="button"
                  onClick={() => editor.onUpdateComponentData(componentId, { ...data, color: value })}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                    data.color === value ? "border-ink scale-110" : "border-transparent hover:border-ink/30"
                  }`}
                  style={{ backgroundColor: value }}
                />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
