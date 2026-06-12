"use client";

import { useDatabaseContext } from "@/context/database-context";
import { useTemplateQuery } from "@/hooks/api/use-templates-query";
import { useUpdateTemplate } from "@/hooks/api/use-template-mutations";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useParams } from "next/navigation";
import { LayoutGrid, PenLine } from "lucide-react";
import { useState, useEffect } from "react";
import { TemplatePropertyRow } from "./_components/template-property-row";
import { useTranslations } from "next-intl";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Link } from "@/i18n/navigation";
import { ContentArea } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area";
import { useContentEditor } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { normalizeContentSchema } from "@/lib/content-schema";

const TOKENS = [
  { token: "{{today}}", desc: "DD.MM.YYYY" },
  { token: "{{year}}", desc: "Current year" },
  { token: "{{month}}", desc: "Month index (01–12)" },
  { token: "{{count}}", desc: "Record count + 1" },
  { token: "{{count:Prop=Val}}", desc: "Filtered count + 1" },
];

export default function TemplatePage() {
  const params = useParams<{ id: string; templateId: string }>();
  const databaseId = params.id;
  const templateId = params.templateId;
  const { properties, isLoading: isDbContextLoading } = useDatabaseContext();
  const recordT = useTranslations("RecordPage");
  const t = useTranslations("TemplateEdit");

  const { data: template, isLoading: isTemplateLoading } = useTemplateQuery(templateId);
  const updateTemplateMutation = useUpdateTemplate(databaseId);

  const [localValues, setLocalValues] = useState<Record<string, { id: string; value: unknown }>>({});
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const contentEditor = useContentEditor({
    initialContent: template ? normalizeContentSchema(template.content) : undefined,
    isLoading: isTemplateLoading,
    onSave: () => {},
  });

  useEffect(() => {
    if (template) {
      if (!isEditingName) setName(template.name ?? "");
      if (template.values) {
        const valueMap: Record<string, { id: string; value: unknown }> = {};
        template.values.forEach((v) => {
          valueMap[v.propertyId] = { id: v.id, value: v.value };
        });
        setLocalValues(valueMap);
      }
    }
  }, [template, isEditingName]);

  const isLoading = isTemplateLoading || isDbContextLoading;
  if (isLoading) return <PageLoader />;

  async function handleNameSave() {
    const trimmed = name.trim();
    if (trimmed !== (template?.name ?? "")) {
      await updateTemplateMutation.mutateAsync({ id: templateId, data: { name: trimmed || recordT("untitled") } });
    }
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar animate-fade-up px-8 py-10">
      <div className="mb-8 flex items-center gap-3 min-w-0">
        <span className="text-ink-muted shrink-0">
          {template?.icon ? <IconDisplay value={template.icon} size={28} /> : <LayoutGrid size={28} />}
        </span>
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

      <div className="grid gap-8 mb-8 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-8">
          <section>
            <div className="card p-0 overflow-hidden">
              <div className="divide-y divide-stroke-subtle">
                {properties.map((property) => {
                  const valueData = localValues[property.id];
                  return (
                    <TemplatePropertyRow
                      key={property.id}
                      templateId={templateId}
                      databaseId={databaseId}
                      property={property}
                      value={valueData?.value}
                      valueId={valueData?.id}
                    />
                  );
                })}
              </div>
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
