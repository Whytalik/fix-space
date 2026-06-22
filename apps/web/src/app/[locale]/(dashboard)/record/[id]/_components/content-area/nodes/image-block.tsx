"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ImageIcon, Upload, Link } from "lucide-react";
import type { ImageComponentData } from "@fixspace/domain";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { Button } from "@/components/ui/primitives/actions/button";
import { uploadContentImage } from "@/lib/api/record-content";
import { uploadTemplateContentImage } from "@/lib/api/template";
import { parseApiError } from "@/lib/api/client";

interface ImageDisplayProps {
  data: ImageComponentData;
  isEditing?: boolean;
  onUpdate: (data: ImageComponentData) => void;
  onStartReplace: () => void;
  onClear: () => void;
}

function ImageDisplay({ data, isEditing, onStartReplace, onClear }: ImageDisplayProps) {
  const t = useTranslations("RecordPage.canvas");
  const containerReference = useRef<HTMLDivElement>(null);
  const [widthPct, setWidthPct] = useState<number>(100);

  const handleResizeStart = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = containerReference.current?.clientWidth ?? 0;
    const parentWidth = containerReference.current?.parentElement?.clientWidth ?? 1;

    const onMove = (pointerEvent: PointerEvent) => {
      const delta = pointerEvent.clientX - startX;
      const newPx = Math.max(80, startWidth + delta);
      setWidthPct(Math.min(100, (newPx / parentWidth) * 100));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  return (
    <div className={`flex w-full ${data.align === "center" ? "justify-center" : data.align === "right" ? "justify-end" : "justify-start"}`}>
      <div ref={containerReference} style={{ width: `${widthPct}%` }} className="relative group/img max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.url} alt="" className="w-full h-auto rounded-lg object-contain max-h-[480px] block" />

        {isEditing && (
          <div
            onPointerDown={handleResizeStart}
            className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-150"
          >
            <div className="w-1 h-8 rounded-full bg-stroke-subtle" />
          </div>
        )}

        <div className="absolute top-2 right-4 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={onStartReplace}
            className="px-2 py-1 bg-elevated border border-stroke rounded-lg text-xs text-ink-secondary hover:text-ink transition-colors duration-150"
          >
            {t("replace")}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-1 bg-elevated border border-stroke rounded-lg text-xs text-ink-secondary hover:text-error transition-colors duration-150"
          >
            {t("remove")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ImageComponentProps {
  data: ImageComponentData;
  recordId?: string;
  templateId?: string;
  isEditing?: boolean;
  onUpdate: (data: ImageComponentData) => void;
}

type ImageTab = "upload" | "url";

export function ImageComponent({ data, recordId, templateId, isEditing, onUpdate }: ImageComponentProps) {
  const t = useTranslations("RecordPage.canvas");
  const fileInputReference = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ImageTab>("upload");
  const [urlInput, setUrlInput] = useState(data.url || "");
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    if (activeTab === "url" && urlInput && urlInput !== data.url) {
      const timer = setTimeout(() => {
        onUpdate({ ...data, url: urlInput });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [urlInput, activeTab, data, onUpdate]);

  const uploadFile = async (file: File) => {
    if (!recordId && !templateId) return;
    setError(null);
    setIsUploading(true);
    try {
      const { url } = recordId ? await uploadContentImage(recordId, file) : await uploadTemplateContentImage(templateId!, file);
      onUpdate({ ...data, url });
      setReplacing(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    await uploadFile(file);
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const imageFile = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      event.preventDefault();
      await uploadFile(imageFile);
      return;
    }
    const text = event.clipboardData.getData("text").trim();
    if (text.startsWith("http://") || text.startsWith("https://")) {
      event.preventDefault();
      onUpdate({ ...data, url: text });
      setReplacing(false);
    }
  };

  const renderContent = () => {
    if (data.url && !replacing) {
      return (
        <ImageDisplay
          data={data}
          isEditing={isEditing}
          onUpdate={onUpdate}
          onStartReplace={() => setReplacing(true)}
          onClear={() => onUpdate({ ...data, url: "" })}
        />
      );
    }

    if (replacing || isEditing) {
      return (
        <div className="w-full">
          <div className="flex border border-stroke rounded-t-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors duration-150 ${activeTab === "upload" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"}`}
            >
              <Upload size={12} /> {t("upload")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors duration-150 ${activeTab === "url" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"}`}
            >
              <Link size={12} /> {t("url")}
            </button>
            {replacing && (
              <button
                type="button"
                onClick={() => setReplacing(false)}
                className="px-2 text-ink-muted hover:text-ink text-xs transition-colors duration-150"
              >
                {t("cancel")}
              </button>
            )}
          </div>
          {activeTab === "upload" && (
            <div
              onPaste={handlePaste}
              className="w-full py-10 flex flex-col items-center justify-center gap-3 border border-t-0 border-dashed border-stroke rounded-b-2xl text-ink-muted hover:text-ink-secondary transition-colors duration-150 focus:outline-none focus:border-accent bg-surface/50"
            >
              {isUploading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <ImageIcon size={24} className="opacity-50" />
                  <Button variant="secondary" size="sm" onClick={() => fileInputReference.current?.click()}>
                    {t("chooseFile")}
                  </Button>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{t("orPasteImage")}</span>
                    <span className="text-xs opacity-40">{t("uploadHint")}</span>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === "url" && (
            <div className="border border-t-0 border-stroke rounded-b-2xl p-3 flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                placeholder="https://example.com/image.png"
                className="flex-1 text-xs bg-transparent outline-none text-ink placeholder:text-ink-muted min-w-0"
                autoFocus
              />
            </div>
          )}
          {error && <p className="mt-1 text-xs text-error">{error}</p>}
        </div>
      );
    }

    return (
      <div
        onPaste={handlePaste}
        tabIndex={0}
        className="w-full py-8 flex flex-col items-center justify-center gap-3 border border-dashed border-stroke rounded-2xl text-ink-muted hover:border-stroke-subtle transition-colors duration-150 cursor-default focus:outline-none focus:border-accent"
      >
        {isUploading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <ImageIcon size={20} className="opacity-50" />
            <Button variant="secondary" size="sm" onClick={() => fileInputReference.current?.click()}>
              {t("chooseFile")}
            </Button>
            <span className="text-xs opacity-60 italic">{t("pasteImage")}</span>
          </>
        )}
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <input
        ref={fileInputReference}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </>
  );
}
