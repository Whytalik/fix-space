"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type {
  ContentComponentData,
  ContentComponentNode,
  ImageComponentData,
  TextComponentData,
  HeadingComponentData,
} from "@fixspace/domain";
import { ContentComponentType } from "@fixspace/domain";
import { ImageIcon, Upload, Link, GripVertical } from "lucide-react";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { TextProperty } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/fields/text-property";
import { uploadContentImage } from "@/lib/api/record-content";
import { uploadTemplateContentImage } from "@/lib/api/template";
import { parseApiError } from "@/lib/api/client";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/primitives/actions/button";

interface ContentComponentProps {
  component: ContentComponentNode;
  recordId?: string;
  templateId?: string;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, type: ContentComponentType) => void;
  onDelete: (id: string) => void;
  onUpdateData: (id: string, data: ContentComponentData) => void;
  rowId?: string;
  columnId?: string;
}

export function ContentComponent({
  component,
  recordId,
  templateId,
  isEditing,
  isSelected,
  onSelect,
  onUpdateData,
  rowId,
  columnId,
}: ContentComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
    data: { dragType: "component", componentId: component.id, componentType: component.type, rowId, columnId },
    disabled: !isEditing,
  });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`group/component relative rounded-lg transition-all duration-150 ${isDragging ? "z-50 opacity-0 pointer-events-none" : ""}
        ${isSelected ? "ring-2 ring-accent" : isEditing ? "hover:bg-surface-hover hover:ring-1 hover:ring-stroke" : ""}
        ${isEditing ? "cursor-pointer" : ""}`}
      onClick={(e) => {
        if (!isEditing) return;
        e.stopPropagation();
        onSelect?.(component.id, component.type);
      }}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink opacity-0 group-hover/component:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
        >
          <GripVertical size={14} />
        </div>
      )}

      <div className={isDragging ? "invisible" : ""}>
        <ComponentRenderer
          component={component}
          recordId={recordId}
          templateId={templateId}
          isEditing={isEditing}
          onUpdateData={onUpdateData}
        />
      </div>
    </div>
  );
}

interface RendererProps {
  component: ContentComponentNode;
  recordId?: string;
  templateId?: string;
  isEditing?: boolean;
  onUpdateData: (id: string, data: ContentComponentData) => void;
}

const HEADING_STYLES: Record<number, string> = {
  1: "text-4xl font-bold leading-tight",
  2: "text-3xl font-bold leading-tight",
  3: "text-2xl font-semibold leading-snug",
  4: "text-xl font-semibold leading-snug",
  5: "text-lg font-semibold",
  6: "text-base font-bold uppercase tracking-wider",
};

function ComponentRenderer({ component, recordId, templateId, isEditing, onUpdateData }: RendererProps) {
  const t = useTranslations("RecordPage.canvas");
  const data = component.data as TextComponentData & HeadingComponentData & ImageComponentData & { style?: string };

  if (component.type === ContentComponentType.TEXT) {
    return (
      <div style={{ textAlign: data.align || "left" }}>
        <TextProperty
          ghost
          value={data.html ?? ""}
          onChange={(html) => onUpdateData(component.id, { html })}
          placeholder={t("typeSomething")}
        />
      </div>
    );
  }

  if (component.type === ContentComponentType.HEADING) {
    const level = data.level || 1;
    const align = data.align || "left";
    return (
      <div className={HEADING_STYLES[level]} style={{ textAlign: align }}>
        <TextProperty
          ghost
          value={data.html ?? ""}
          onChange={(html) => onUpdateData(component.id, { html })}
          placeholder={`Heading ${level}...`}
          editorClass="text-inherit leading-inherit"
        />
      </div>
    );
  }

  if (component.type === ContentComponentType.IMAGE) {
    return (
      <ImageComponent
        data={component.data as ImageComponentData}
        recordId={recordId}
        templateId={templateId}
        isEditing={isEditing}
        onUpdate={(next) => onUpdateData(component.id, next)}
      />
    );
  }

  if (component.type === ContentComponentType.DIVIDER) {
    return (
      <div className="py-4">
        <div
          className={`w-full border-t border-stroke ${data.style === "dashed" ? "border-dashed" : data.style === "dotted" ? "border-dotted" : "border-solid"}`}
        />
      </div>
    );
  }

  return null;
}

interface ImageDisplayProps {
  data: ImageComponentData;
  isEditing?: boolean;
  onUpdate: (data: ImageComponentData) => void;
  onStartReplace: () => void;
  onClear: () => void;
}

function ImageDisplay({ data, isEditing, onStartReplace, onClear }: ImageDisplayProps) {
  const t = useTranslations("RecordPage.canvas");
  const containerRef = useRef<HTMLDivElement>(null);
  const [widthPct, setWidthPct] = useState<number>(100);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = containerRef.current?.clientWidth ?? 0;
    const parentWidth = containerRef.current?.parentElement?.clientWidth ?? 1;

    const onMove = (pe: PointerEvent) => {
      const delta = pe.clientX - startX;
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
      <div ref={containerRef} style={{ width: `${widthPct}%` }} className="relative group/img max-w-full">
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

function ImageComponent({ data, recordId, templateId, isEditing, onUpdate }: ImageComponentProps) {
  const t = useTranslations("RecordPage.canvas");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ImageTab>("upload");
  const [urlInput, setUrlInput] = useState(data.url || "");
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    if (tab === "url" && urlInput && urlInput !== data.url) {
      const timer = setTimeout(() => {
        onUpdate({ ...data, url: urlInput });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [urlInput, tab, data, onUpdate]);

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

  const handlePaste = async (e: React.ClipboardEvent) => {
    const imageFile = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (imageFile) {
      e.preventDefault();
      await uploadFile(imageFile);
      return;
    }
    const text = e.clipboardData.getData("text").trim();
    if (text.startsWith("http://") || text.startsWith("https://")) {
      e.preventDefault();
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
              onClick={() => setTab("upload")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors duration-150 ${tab === "upload" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"}`}
            >
              <Upload size={12} /> {t("upload")}
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors duration-150 ${tab === "url" ? "bg-surface-hover text-ink" : "text-ink-muted hover:text-ink-secondary"}`}
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
          {tab === "upload" && (
            <div
              onPaste={handlePaste}
              className="w-full py-10 flex flex-col items-center justify-center gap-3 border border-t-0 border-dashed border-stroke rounded-b-2xl text-ink-muted hover:text-ink-secondary transition-colors duration-150 focus:outline-none focus:border-accent bg-canvas-subtle/50"
            >
              {isUploading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <ImageIcon size={24} className="opacity-50" />
                  <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Choose file
                  </Button>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-medium">or paste image</span>
                    <span className="text-[10px] opacity-40">PNG, JPG, WebP · max 5 MB</span>
                  </div>
                </>
              )}
            </div>
          )}
          {tab === "url" && (
            <div className="border border-t-0 border-stroke rounded-b-2xl p-3 flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
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
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Choose file
            </Button>
            <span className="text-xs opacity-60 italic">or paste image (Ctrl+V)</span>
          </>
        )}
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
    </>
  );
}
