"use client";

import { useDatabaseContext } from "@/context/database-context";
import { useTemplateQuery } from "@/hooks/api/use-templates-query";
import { useUpdateTemplate } from "@/hooks/api/use-template-mutations";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useParams } from "next/navigation";
import { LayoutGrid, PenLine } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPropertyGroups } from "@/lib/api/property-group";
import { queryKeys } from "@/lib/api/query-keys";
import { PropertyList } from "@/components/database/property-list";
import { useTranslations } from "next-intl";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Link } from "@/i18n/navigation";
import { ContentArea } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area";
import { useContentEditor } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { normalizeContentSchema } from "@/lib/content-schema";

export default function TemplatePage() {
  const params = useParams<{ id: string; templateId: string }>();
  const databaseId = params.id;
  const templateId = params.templateId;
  const { properties, isLoading: isDbContextLoading } = useDatabaseContext();
  const recordT = useTranslations("RecordPage");
  const t = useTranslations("TemplateEdit");

  const TOKENS = [
    { token: "{{today}}", desc: t("tokens.today") },
    { token: "{{year}}", desc: t("tokens.year") },
    { token: "{{month}}", desc: t("tokens.month") },
    { token: "{{month_name}}", desc: t("tokens.month_name") },
    { token: "{{count}}", desc: t("tokens.count") },
    { token: "{{count:Prop=Val}}", desc: t("tokens.countWithValue") },
  ];

  const { data: template, isLoading: isTemplateLoading } = useTemplateQuery(templateId);
  const updateTemplateMutation = useUpdateTemplate(databaseId);

  const initialContent = useMemo(() => (template ? normalizeContentSchema(template.content) : undefined), [template]);

  const { data: propertyGroups = [] } = useQuery({
    queryKey: queryKeys.propertyGroups.all(databaseId),
    queryFn: () => getPropertyGroups(databaseId),
    enabled: !!databaseId,
  });

  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  const contentEditor = useContentEditor({
    initialContent,
    isLoading: isTemplateLoading,
    onSave: () => {},
  });

  useEffect(() => {
    if (template) {
      if (!isEditingName) setName(template.name ?? "");
      if (!isEditingDescription) setDescription(template.description ?? "");
    }
  }, [template, isEditingName, isEditingDescription]);

  const isLoading = isTemplateLoading || isDbContextLoading;
  if (isLoading) return <PageLoader />;

  async function handleNameSave() {
    const trimmed = name.trim();
    if (trimmed !== (template?.name ?? "")) {
      await updateTemplateMutation.mutateAsync({ id: templateId, data: { name: trimmed || recordT("untitled") } });
    }
  }

  async function handleDescriptionSave() {
    const trimmed = description.trim();
    if (trimmed !== (template?.description ?? "")) {
      await updateTemplateMutation.mutateAsync({ id: templateId, data: { description: trimmed } });
    }
  }

  async function handleIconSave(value: string) {
    setShowIconPicker(false);
    await updateTemplateMutation.mutateAsync({ id: templateId, data: { icon: value } });
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar animate-fade-up px-8 py-10">
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            ref={iconButtonRef}
            type="button"
            onClick={() => setShowIconPicker((prev) => !prev)}
            className="text-ink-muted shrink-0 hover:text-ink transition-colors duration-150 rounded-lg p-0.5 hover:bg-surface-hover"
          >
            {template?.icon ? <IconDisplay value={template.icon} size={28} /> : <LayoutGrid size={28} />}
          </button>
          {showIconPicker && (
            <IconPicker
              value={template?.icon ?? ""}
              onChange={handleIconSave}
              onClose={() => setShowIconPicker(false)}
              anchorEl={iconButtonRef.current}
            />
          )}
          <input
            type="text"
            className="type-page-title bg-transparent border-0 outline-none p-0 min-w-0 w-full placeholder:text-ink-muted"
            value={name}
            placeholder={recordT("untitled")}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setIsEditingName(true)}
            onBlur={() => {
              setIsEditingName(false);
              handleNameSave();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </div>
        <textarea
          className="w-full bg-transparent border-0 outline-none resize-none text-sm text-ink-secondary placeholder:text-ink-muted leading-relaxed overflow-hidden"
          rows={1}
          value={description}
          placeholder={t("descriptionPlaceholder")}
          onChange={(e) => {
            setDescription(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onFocus={() => setIsEditingDescription(true)}
          onBlur={() => {
            setIsEditingDescription(false);
            handleDescriptionSave();
          }}
        />
      </div>

      <div className="grid gap-8 mb-8 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-8">
          <section>
            <div className="card p-4">
              <PropertyList properties={properties} entity={template!} mode="template" propertyGroups={propertyGroups} />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <div className="card p-4 space-y-3">
              <span className="type-nav-label text-ink-muted block">{t("tokensTitle")}</span>
              <div className="space-y-3">
                {TOKENS.map((item) => (
                  <div key={item.token} className="flex flex-col gap-1">
                    <code className="text-xs font-bold text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20 self-start">
                      {item.token}
                    </code>
                    <span className="text-xs text-ink-muted">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="type-nav-label text-ink-muted">{recordT("content")}</h2>
          <Link
            href={`/database/${databaseId}/template/${templateId}/editor`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stroke text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors duration-150"
          >
            <PenLine size={13} />
            {recordT("editLayout")}
          </Link>
        </div>
        <ContentArea editor={contentEditor} mode="view" />
      </section>
    </div>
  );
}
