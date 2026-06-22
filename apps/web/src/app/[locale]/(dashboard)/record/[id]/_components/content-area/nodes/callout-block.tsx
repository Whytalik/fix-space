"use client";

import { useTranslations } from "next-intl";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { CalloutComponentData } from "@fixspace/domain";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { TextProperty } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/fields/text-property";

interface CalloutComponentProps {
  data: CalloutComponentData;
  isEditing?: boolean;
  onUpdate: (data: CalloutComponentData) => void;
}

const CALLOUT_STYLES: Record<
  "info" | "warning" | "success" | "danger",
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  info: {
    bg: "bg-accent/8",
    text: "text-accent",
    border: "border-accent/30",
    icon: <Info size={16} />,
  },
  warning: {
    bg: "bg-warning/8",
    text: "text-warning",
    border: "border-warning/30",
    icon: <AlertTriangle size={16} />,
  },
  success: {
    bg: "bg-success/8",
    text: "text-success",
    border: "border-success/30",
    icon: <CheckCircle size={16} />,
  },
  danger: {
    bg: "bg-error/8",
    text: "text-error",
    border: "border-error/30",
    icon: <XCircle size={16} />,
  },
};

export function CalloutComponent({ data, onUpdate }: CalloutComponentProps) {
  const t = useTranslations("RecordPage.canvas");
  const type = data.type || "info";

  if (type === "custom") {
    const hasColor = Boolean(data.color);
    return (
      <div
        className={`p-4 rounded-2xl border flex gap-3 ${hasColor ? "" : "bg-surface border-stroke"}`}
        style={hasColor ? { backgroundColor: `${data.color}18`, borderColor: `${data.color}40` } : undefined}
      >
        <div className="shrink-0 mt-1.5" style={hasColor ? { color: data.color! } : undefined}>
          {data.icon ? <IconDisplay value={data.icon} size={18} /> : <Info size={16} />}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <TextProperty
            ghost
            value={data.title ?? ""}
            readOnly={false}
            onChange={(title) => onUpdate({ ...data, title })}
            placeholder={t("calloutTitle")}
            editorClass="text-sm font-bold text-ink"
          />
          <div className="border-t border-stroke/30 my-0.5" />
          <TextProperty
            ghost
            value={data.html ?? ""}
            readOnly={false}
            onChange={(html) => onUpdate({ ...data, html })}
            placeholder={t("calloutText")}
            editorClass="text-sm text-ink-secondary"
          />
        </div>
      </div>
    );
  }

  const styles = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info;

  return (
    <div className={`p-4 rounded-2xl border flex gap-3 ${styles.bg} ${styles.border}`}>
      <div className={`${styles.text} shrink-0 mt-1.5`}>{data.icon ? <IconDisplay value={data.icon} size={18} /> : styles.icon}</div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <TextProperty
          ghost
          value={data.title ?? ""}
          readOnly={false}
          onChange={(title) => onUpdate({ ...data, title })}
          placeholder={t("calloutTitle")}
          editorClass="text-sm font-bold text-ink"
        />

        <div className="border-t border-stroke/30 my-0.5" />

        <TextProperty
          ghost
          value={data.html ?? ""}
          readOnly={false}
          onChange={(html) => onUpdate({ ...data, html })}
          placeholder={t("calloutText")}
          editorClass="text-sm text-ink-secondary"
        />
      </div>
    </div>
  );
}
