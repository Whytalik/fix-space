"use client";

import { useTranslations } from "next-intl";
import { BarChart2 } from "lucide-react";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import type { DatabaseStatBlockDto } from "@fixspace/domain";
import type { VisibleSections } from "../_types";
import { PresetStatCard } from "./preset-stat-card";

interface PresetOverviewGridProps {
  blocks?: DatabaseStatBlockDto[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  sections: VisibleSections;
  hiddenProps: Record<string, Set<string>>;
}

export function PresetOverviewGrid({ blocks, isPending, isError, onRetry, sections, hiddenProps }: PresetOverviewGridProps) {
  const t = useTranslations("Statistics");

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-error">{t("loadError")}</p>
        <button type="button" onClick={onRetry} className="text-xs text-accent hover:underline">
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <BarChart2 size={32} className="text-ink-muted" />
        <p className="text-sm text-ink-secondary">{t("overviewEmpty")}</p>
        <p className="type-hint text-ink-muted text-center max-w-xs">{t("overviewEmptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {blocks.map((block) => (
        <PresetStatCard key={block.databaseId} block={block} sections={sections} hiddenProps={hiddenProps[block.databaseId]} />
      ))}
    </div>
  );
}
