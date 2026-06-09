"use client";

import { useTranslations } from "next-intl";

export function IntegrationSettings() {
  const t = useTranslations("IntegrationSettingsComp");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-ink">{t("title")}</h3>
        <p className="mt-1 text-sm text-ink-secondary">{t("description")}</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke-subtle bg-surface py-16">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.5h-3M16.5 9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M3 21l4.35-4.35" />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-ink-secondary">{t("emptyDescription")}</p>
      </div>
    </div>
  );
}
