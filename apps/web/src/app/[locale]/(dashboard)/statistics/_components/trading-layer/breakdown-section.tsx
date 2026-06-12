"use client";

import { useTranslations } from "next-intl";
import type { BreakdownGroupDto } from "@fixspace/domain";
import { BreakdownChart } from "./breakdown-chart";

interface BreakdownSectionProps {
  breakdowns: BreakdownGroupDto[];
  compareBreakdowns?: BreakdownGroupDto[];
}

export function BreakdownSection({ breakdowns, compareBreakdowns }: BreakdownSectionProps) {
  const t = useTranslations("Statistics");

  const nonEmpty = breakdowns.filter((group) => group.items.length > 0);

  if (nonEmpty.length === 0) return null;

  return (
    <div className="mt-4">
      <h2 className="type-panel-title mb-4">{t("breakdowns")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nonEmpty.map((group) => (
          <BreakdownChart
            key={group.propertyName}
            group={group}
            compareGroup={compareBreakdowns?.find((candidate) => candidate.propertyName === group.propertyName)}
          />
        ))}
      </div>
    </div>
  );
}
