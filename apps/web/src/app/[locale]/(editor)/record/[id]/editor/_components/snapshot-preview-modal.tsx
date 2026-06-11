"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { RotateCcw, ArrowLeftRight } from "lucide-react";
import type { ContentSchema } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { TextProperty } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/fields/text-property";
import { useState, type CSSProperties } from "react";
import { ContentComponentType } from "@fixspace/domain";

interface SnapshotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: {
    createdAt: Date | string;
    content: ContentSchema;
  };
  currentContent?: ContentSchema;
  onRestore: () => void;
  isRestoring: boolean;
}

const HEADING_STYLES: Record<number, string> = {
  1: "text-3xl font-bold leading-tight",
  2: "text-2xl font-bold leading-tight",
  3: "text-xl font-semibold leading-snug",
  4: "text-lg font-semibold leading-snug",
  5: "text-base font-semibold",
  6: "text-sm font-bold uppercase tracking-wider",
};

function PreviewContent({ content, title }: { content: ContentSchema; title?: string }) {
  const t = useTranslations("RecordPage.canvas");
  if (content.rows.length === 0)
    return <div className="h-full flex items-center justify-center text-ink-muted italic text-sm">{t("empty")}</div>;

  return (
    <div className="space-y-6">
      {title && <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-4">{title}</p>}
      {content.rows.map((row) => (
        <div key={row.id} className="flex gap-4">
          {row.columns.map((column) => (
            <div key={column.id} style={{ width: `${column.width}%` }} className="min-w-0 flex flex-col gap-3">
              {column.children.map((component) => {
                const data = component.data as {
                  html?: string;
                  url?: string;
                  alt?: string;
                  align?: CSSProperties["textAlign"];
                  level?: number;
                };

                if (component.type === ContentComponentType.TEXT) {
                  return (
                    <div key={component.id} style={{ textAlign: data.align || "left" }}>
                      <TextProperty ghost value={data.html ?? ""} onChange={() => {}} readOnly />
                    </div>
                  );
                }

                if (component.type === ContentComponentType.HEADING) {
                  const level = data.level || 1;
                  return (
                    <div key={component.id} className={HEADING_STYLES[level]} style={{ textAlign: data.align || "left" }}>
                      <TextProperty ghost value={data.html ?? ""} onChange={() => {}} readOnly />
                    </div>
                  );
                }

                if (component.type === ContentComponentType.IMAGE && data.url) {
                  return (
                    <div
                      key={component.id}
                      className={`flex w-full ${data.align === "center" ? "justify-center" : data.align === "right" ? "justify-end" : "justify-start"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={data.url} alt="" className="w-full h-auto rounded-lg border border-stroke shadow-sm" />
                    </div>
                  );
                }

                if (component.type === ContentComponentType.DIVIDER) {
                  return (
                    <div key={component.id} className="py-4">
                      <div className="w-full border-t border-stroke" />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SnapshotPreviewModal({ isOpen, onClose, snapshot, currentContent, onRestore, isRestoring }: SnapshotPreviewModalProps) {
  const t = useTranslations("RecordPage");
  const [isComparing, setIsComparing] = useState(false);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={isComparing ? t("compareVersions") : `${t("viewVersion")} — ${new Date(snapshot.createdAt).toLocaleString()}`}
      size="xl"
    >
      <div className="flex flex-col h-[85vh]">
        <div className="flex-1 overflow-hidden flex">
          <div className={`flex-1 overflow-y-auto p-8 scrollbar border-r border-stroke ${isComparing ? "bg-surface/30" : ""}`}>
            <PreviewContent
              content={snapshot.content}
              title={isComparing ? `${t("history")} (${new Date(snapshot.createdAt).toLocaleTimeString()})` : undefined}
            />
          </div>

          {isComparing && currentContent && (
            <div className="flex-1 overflow-y-auto p-8 scrollbar">
              <PreviewContent content={currentContent} title="Current Version" />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stroke bg-surface shrink-0 flex justify-between items-center">
          <div>
            {currentContent && (
              <Button
                variant={isComparing ? "primary" : "secondary"}
                size="sm"
                onClick={() => setIsComparing(!isComparing)}
                leftIcon={<ArrowLeftRight size={16} />}
              >
                {isComparing ? "Exit Comparison" : t("compareVersions")}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              {t("inspector.cancel")}
            </Button>
            <Button variant="primary" onClick={onRestore} loading={isRestoring} leftIcon={<RotateCcw size={16} />}>
              {t("restore")}
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
