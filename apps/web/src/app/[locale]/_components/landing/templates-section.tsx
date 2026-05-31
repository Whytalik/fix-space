import { ClipboardList, FilePlus, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";

export function TemplatesSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

  const templates = [
    { icon: ClipboardList, name: t("postTradeAnalysis") },
    { icon: FilePlus, name: t("newSetupIdea") },
    { icon: Sparkles, name: t("weeklyReview") },
    { icon: FilePlus, name: t("monthlyReview") },
    { icon: ClipboardList, name: t("mistakeLog") },
    { icon: Sparkles, name: t("tradingPlan") },
  ];

  return (
    <>
      <SectionHeader
        eyebrow={tNav("templates")}
        title={t("neverBlankPage.title")}
        description={t("neverBlankPage.description")}
        mb="mb-14"
      />

      <div className="flex items-center justify-center w-full">
        <div className="bg-elevated border border-stroke-subtle rounded-2xl p-8 sm:p-10 w-full max-w-2xl shadow-2xl relative">
          <div className="absolute top-4 left-6 flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/20" />
          </div>

          <div className="mt-4">
            <p className="type-landing-body font-bold mb-6 text-center">{t("newRecordTemplate")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {templates.map(({ icon: Icon, name }) => (
                <div
                  key={name}
                  className="flex flex-col gap-3 bg-surface border border-stroke rounded-xl p-5 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0 border border-stroke group-hover:border-accent/30 transition-colors">
                    <Icon size={18} className="text-ink-muted group-hover:text-accent transition-colors" />
                  </div>
                  <span className="type-landing-nav group-hover:text-ink transition-colors">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
