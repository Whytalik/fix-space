import { Activity, AlertCircle, BarChart2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";

export function InstrumentTypesSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

  const cards = [
    {
      key: "trades",
      icon: <BarChart2 size={18} className="text-accent" />,
    },
    {
      key: "dayAnalysis",
      icon: <Activity size={18} className="text-accent" />,
    },
    {
      key: "notes",
      icon: <FileText size={18} className="text-accent" />,
    },
    {
      key: "mistakes",
      icon: <AlertCircle size={18} className="text-accent" />,
    },
  ];

  return (
    <>
      <SectionHeader
        eyebrow={tNav("dataTypes")}
        title={t("instrumentTypes.subtitle")}
        description={t("instrumentTypes.description")}
        descriptionClassName="mt-4 max-w-140"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mt-12">
        {cards.map((card) => (
          <div
            key={card.key}
            className="bg-surface border border-stroke rounded-2xl p-6 flex flex-col h-full hover:border-accent/50 transition-colors duration-150"
          >
            <div className="bg-accent/10 w-10 h-10 rounded-lg flex items-center justify-center mb-5">{card.icon}</div>
            <h3 className="type-landing-h3 mb-2">{t(`instrumentTypes.${card.key}.title`)}</h3>
            <p className="type-landing-body-muted">{t(`instrumentTypes.${card.key}.description`)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
