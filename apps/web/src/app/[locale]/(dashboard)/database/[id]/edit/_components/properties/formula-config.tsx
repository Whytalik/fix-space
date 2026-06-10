"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { FormulaPropertyConfig, PropertyResponseDto } from "@fixspace/domain";
import { FormulaType } from "@fixspace/domain";
import type { FormulaPresetName } from "@fixspace/domain";
import { ChevronLeft } from "lucide-react";
import { previewFormulaForDatabase } from "@/lib/api/property";
import { PRESET_META } from "./formula-presets.meta";
import { FormulaWizard } from "./formula-wizard";
import { FormulaCustomBuilder } from "./formula-custom-builder";

type FormulaConfigProps = {
  config: FormulaPropertyConfig;
  properties: PropertyResponseDto[];
  onPatch: (patch: Partial<FormulaPropertyConfig>) => void;
};

type View = "gallery" | "wizard" | "custom";

export function FormulaConfig({ config, properties, onPatch }: FormulaConfigProps) {
  const t = useTranslations("Formula");
  const params = useParams<{ id: string }>();
  const databaseId = params?.id ?? "";

  const [view, setView] = useState<View>(() => {
    if (config.presetName) return "wizard";
    if (config.type === FormulaType.CUSTOM) return "custom";
    return "gallery";
  });

  const { data: preview } = useQuery({
    queryKey: ["formula-preview", databaseId, config.expression, config.resultType],
    queryFn: () => previewFormulaForDatabase(databaseId, config as unknown as Record<string, unknown>),
    enabled: !!databaseId && !!config.expression,
    staleTime: 5000,
    retry: false,
  });

  function selectPreset(preset: FormulaPresetName) {
    onPatch({ type: FormulaType.PRESET, presetName: preset, uiState: {}, expression: "" });
    setView("wizard");
  }

  function goToCustom() {
    onPatch({ type: FormulaType.CUSTOM, presetName: undefined, uiState: {}, expression: "" });
    setView("custom");
  }

  function goBack() {
    setView("gallery");
  }

  if (view === "gallery") {
    const allPresets = Object.keys(PRESET_META) as FormulaPresetName[];

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-2">
          {allPresets.map((preset) => {
            const meta = PRESET_META[preset];
            const available = meta.isAvailable(properties);
            return (
              <button
                key={preset}
                type="button"
                disabled={!available}
                onClick={() => selectPreset(preset)}
                className="flex flex-col gap-1 p-3 bg-surface border border-stroke rounded-2xl text-left hover:border-accent hover:bg-accent-muted transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-stroke disabled:hover:bg-surface"
              >
                <p className="type-form-label text-ink">{t(meta.nameKey)}</p>
                <p className="type-hint">{t(meta.descriptionKey)}</p>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={goToCustom}
          className="flex flex-col gap-1 p-4 bg-surface border-2 border-dashed border-stroke rounded-2xl text-left hover:border-accent hover:bg-accent-muted transition-colors duration-150"
        >
          <p className="type-form-label text-ink">{t("gallery.customFormula")}</p>
          <p className="type-hint">{t("gallery.customFormulaDesc")}</p>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1.5 text-ink-secondary hover:text-ink transition-colors duration-150 self-start"
      >
        <ChevronLeft size={14} />
        <span className="type-hint">{t("gallery.backToGallery")}</span>
      </button>

      {view === "wizard" && <FormulaWizard config={config} properties={properties} onPatch={onPatch} />}
      {view === "custom" && <FormulaCustomBuilder config={config} properties={properties} onPatch={onPatch} />}

      {preview !== undefined && config.expression && (
        <div className="pt-3 border-t border-stroke">
          <p className="type-hint uppercase tracking-widest mb-2">{preview.isSample ? t("gallery.previewSample") : t("gallery.preview")}</p>
          <div className="px-3 py-2 bg-canvas rounded-lg border border-stroke">
            <p className="font-mono text-sm text-ink">
              {preview.result === null || preview.result === undefined ? "—" : String(preview.result)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
