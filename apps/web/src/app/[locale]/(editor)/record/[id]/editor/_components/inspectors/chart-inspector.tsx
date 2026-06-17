"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LineChart, BarChart3, PieChart as PieChartIcon, Activity, Zap, MousePointer2 } from "lucide-react";
import type { ChartComponentData, ChartAggregate, RelationPropertyConfig } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";
import type { ContentEditorState } from "@/app/[locale]/(dashboard)/record/[id]/_components/content-area/lib/use-content-editor";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { usePropertiesQuery } from "@/hooks/api/use-properties-query";
import { useRecordQuery } from "@/hooks/api/use-record-query";
import { Section } from "./section";
import { findComponent } from "./utils";

interface ChartInspectorProps {
  componentId: string;
  editor: ContentEditorState;
}

export function ChartInspector({ componentId, editor }: ChartInspectorProps) {
  const t = useTranslations("RecordPage.inspector");
  const parameters = useParams<{ id: string }>();
  const { data: record } = useRecordQuery(parameters.id);
  const component = findComponent(editor.content, componentId);
  const rawData = (component?.data ?? { chartType: "line", source: { type: "record-properties", fields: [] } }) as ChartComponentData;
  const data: ChartComponentData = { ...rawData, source: rawData.source ?? { type: "record-properties", fields: [] } };

  const { data: properties = [] } = usePropertiesQuery(record?.databaseId || "", { enabled: !!record?.databaseId });

  const numericProperties = useMemo(() => properties.filter((property) => property.type === PropertyType.NUMBER), [properties]);
  const relationProperties = useMemo(() => properties.filter((property) => property.type === PropertyType.RELATION), [properties]);

  const targetDatabaseId = useMemo(() => {
    const source = data.source;
    if (source.type !== "relation") return null;
    const property = properties.find((prop) => prop.name === source.relationField);
    if (property?.type === PropertyType.RELATION) {
      return (property.config as RelationPropertyConfig)?.relatedEntityId;
    }
    return null;
  }, [data.source, properties]);

  const { data: targetProperties = [] } = usePropertiesQuery(targetDatabaseId || "", { enabled: !!targetDatabaseId });

  const update = (patch: Partial<ChartComponentData>) => {
    editor.onUpdateComponentData(componentId, { ...data, ...patch });
  };

  const updateSource = (patch: Partial<ChartComponentData["source"]>) => {
    update({ source: { ...data.source, ...patch } as ChartComponentData["source"] });
  };

  const sourceLabels: Record<string, string> = {
    "record-properties": t("sourceRecordProperties"),
    relation: t("sourceRelation"),
  };

  const aggregationLabels: Record<string, string> = {
    avg: t("aggregationAvg"),
    sum: t("aggregationSum"),
    count: t("aggregationCount"),
    "cumulative-sum": t("aggregationCumulativeSum"),
  };

  return (
    <div className="flex flex-col gap-6">
      <Section label={t("chartTitle")}>
        <input
          value={data.title || ""}
          onChange={(event) => update({ title: event.target.value })}
          placeholder={t("chartTitlePlaceholder")}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stroke bg-transparent text-ink focus:outline-none focus:border-accent"
        />
      </Section>

      <Section label={t("chartType")}>
        <div className="grid grid-cols-3 gap-1">
          {(
            [
              { id: "line", icon: <LineChart size={14} /> },
              { id: "bar", icon: <BarChart3 size={14} /> },
              { id: "pie", icon: <PieChartIcon size={14} /> },
              { id: "area", icon: <Activity size={14} /> },
              { id: "radar", icon: <Zap size={14} /> },
              { id: "scatter", icon: <MousePointer2 size={14} /> },
            ] as const
          ).map(({ id, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => update({ chartType: id })}
              className={`py-2.5 flex items-center justify-center rounded-lg border transition-all duration-150 ${
                data.chartType === id ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </Section>

      <Section label={t("dataSource")}>
        <div className="flex gap-1 mb-3">
          {(["record-properties", "relation"] as const).map((sourceType) => (
            <button
              key={sourceType}
              type="button"
              onClick={() =>
                update({
                  source:
                    sourceType === "record-properties"
                      ? { type: "record-properties", fields: [] }
                      : { type: "relation", relationField: "", xField: "", yField: "" },
                })
              }
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-colors duration-150 ${
                data.source.type === sourceType ? "border-accent bg-accent/10 text-accent" : "border-stroke text-ink-muted hover:text-ink"
              }`}
            >
              {sourceLabels[sourceType]}
            </button>
          ))}
        </div>

        {data.source.type === "record-properties" ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-ink-muted font-bold uppercase mb-1">{t("selectFields")}</p>
            {numericProperties.map((property) => {
              const fields = data.source.type === "record-properties" ? data.source.fields : [];
              const isChecked = fields.includes(property.name);
              return (
                <label
                  key={property.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer group"
                >
                  <CheckboxInput
                    checked={isChecked}
                    onChange={(checked) => {
                      const nextFields = checked ? [...fields, property.name] : fields.filter((field) => field !== property.name);
                      updateSource({ fields: nextFields });
                    }}
                  />
                  <span className="text-xs text-ink-secondary group-hover:text-ink truncate">{property.name}</span>
                </label>
              );
            })}
            {numericProperties.length === 0 && <p className="text-xs text-ink-muted italic p-2">{t("noNumericProperties")}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] text-ink-muted font-bold uppercase mb-1.5">{t("relationField")}</p>
              <select
                value={data.source.relationField}
                onChange={(event) => updateSource({ relationField: event.target.value })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-stroke bg-canvas text-ink focus:outline-none focus:border-accent"
              >
                <option value="">{t("relationFieldPlaceholder")}</option>
                {relationProperties.map((property) => (
                  <option key={property.id} value={property.name}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {targetDatabaseId && (
              <>
                <div>
                  <p className="text-[10px] text-ink-muted font-bold uppercase mb-1.5">{t("xAxis")}</p>
                  <select
                    value={data.source.xField}
                    onChange={(event) => updateSource({ xField: event.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-stroke bg-canvas text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="">{t("selectFieldPlaceholder")}</option>
                    {targetProperties.map((property) => (
                      <option key={property.id} value={property.name}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted font-bold uppercase mb-1.5">{t("yAxis")}</p>
                  <select
                    value={data.source.yField}
                    onChange={(event) => updateSource({ yField: event.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-stroke bg-canvas text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="">{t("selectFieldPlaceholder")}</option>
                    {targetProperties
                      .filter((property) => property.type === PropertyType.NUMBER)
                      .map((property) => (
                        <option key={property.id} value={property.name}>
                          {property.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted font-bold uppercase mb-1.5">{t("aggregation")}</p>
                  <select
                    value={data.source.aggregate || "avg"}
                    onChange={(event) => updateSource({ aggregate: event.target.value as ChartAggregate })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-stroke bg-canvas text-ink focus:outline-none focus:border-accent"
                  >
                    {Object.entries(aggregationLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted font-bold uppercase mb-1.5">{t("groupBy")}</p>
                  <select
                    value={data.source.groupBy || ""}
                    onChange={(event) => updateSource({ groupBy: event.target.value || undefined })}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-stroke bg-canvas text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="">{t("noGrouping")}</option>
                    {targetProperties
                      .filter((property) => property.type !== PropertyType.NUMBER)
                      .map((property) => (
                        <option key={property.id} value={property.name}>
                          {property.name}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
