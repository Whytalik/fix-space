"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FormulaPropertyConfig, PropertyResponseDto } from "@fixspace/domain";
import { FormulaType } from "@fixspace/domain";
import type { FormulaPresetName } from "@fixspace/domain";
import { ChevronLeft } from "lucide-react";
import { PRESET_META } from "./formula-presets.meta";
import { FormulaWizard } from "./formula-wizard";

type FormulaConfigProps = {
  config: FormulaPropertyConfig;
  properties: PropertyResponseDto[];
  onPatch: (patch: Partial<FormulaPropertyConfig>) => void;
};

type View = "gallery" | "wizard";

export function FormulaConfig({ config, properties, onPatch }: FormulaConfigProps) {
  const t = useTranslations("Formula");

  const [view, setView] = useState<View>(() => {
    if (config.presetName) return "wizard";
    return "gallery";
  });

  function selectPreset(preset: FormulaPresetName) {
    onPatch({ type: FormulaType.PRESET, presetName: preset, uiState: {}, expression: "" });
    setView("wizard");
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
    </div>
  );
}
