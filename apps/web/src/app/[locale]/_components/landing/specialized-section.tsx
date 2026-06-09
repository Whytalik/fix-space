import { BarChart2, CheckCircle, Layout, Table, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";

export function SpecializedSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

  return (
    <>
      <SectionHeader
        eyebrow={tNav("market")}
        title={t("approaches.title")}
        description={t("approaches.description")}
        descriptionClassName="mt-4 max-w-140"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mt-10">
        <div className="bg-canvas border border-stroke rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Table size={18} className="text-ink-secondary" />
            <div>
              <p className="type-landing-body-muted font-bold">{t("approaches.googleSheets")}</p>
              <p className="type-landing-caption mt-0.5">{t("approaches.googleSheetsDesc")}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5 type-landing-body-muted">
            <li className="flex items-start gap-2 text-ink-secondary">
              <CheckCircle size={12} className="text-success shrink-0 mt-0.5" />
              <span>{t("approaches.googleSheetsFeatures.freedom")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <X size={12} className="text-error shrink-0 mt-0.5" />
              <span>{t("approaches.googleSheetsFeatures.manual")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <X size={12} className="text-error shrink-0 mt-0.5" />
              <span>{t("approaches.googleSheetsFeatures.fragmentation")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <X size={12} className="text-error shrink-0 mt-0.5" />
              <span>{t("approaches.googleSheetsFeatures.noImport")}</span>
            </li>
          </ul>
        </div>

        <div className="bg-canvas border border-stroke rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Layout size={18} className="text-ink-secondary" />
            <div>
              <p className="type-landing-body-muted font-bold">{t("approaches.notion")}</p>
              <p className="type-landing-caption mt-0.5">{t("approaches.notionDesc")}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5 type-landing-body-muted">
            <li className="flex items-start gap-2 text-ink-secondary">
              <CheckCircle size={12} className="text-success shrink-0 mt-0.5" />
              <span>{t("approaches.notionFeatures.relations")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <CheckCircle size={12} className="text-success shrink-0 mt-0.5" />
              <span>{t("approaches.notionFeatures.centralization")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <X size={12} className="text-error shrink-0 mt-0.5" />
              <span>{t("approaches.notionFeatures.setup")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <X size={12} className="text-error shrink-0 mt-0.5" />
              <span>{t("approaches.notionFeatures.noAnalytics")}</span>
            </li>
          </ul>
        </div>

        <div className="bg-canvas border border-stroke rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 size={18} className="text-ink-secondary" />
            <div>
              <p className="type-landing-body-muted font-bold">{t("approaches.specializedJournals")}</p>
              <p className="type-landing-caption mt-0.5">{t("approaches.exampleGeneric")}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5 type-landing-body-muted">
            <li className="flex items-start gap-2 text-ink-secondary">
              <CheckCircle size={12} className="text-success shrink-0 mt-0.5" />
              <span>{t("approaches.readyDataModel")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <CheckCircle size={12} className="text-success shrink-0 mt-0.5" />
              <span>{t("approaches.autoImport")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <X size={12} className="text-error shrink-0 mt-0.5" />
              <span>{t("approaches.fixedStructure")}</span>
            </li>
            <li className="flex items-start gap-2 text-ink-secondary">
              <X size={12} className="text-error shrink-0 mt-0.5" />
              <span>{t("approaches.paidOnly")}</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
