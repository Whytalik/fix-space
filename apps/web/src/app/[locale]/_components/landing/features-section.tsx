import { Card } from "@/components/ui/primitives/card";
import { Activity, AlertTriangle, BookOpen, CalendarClock, FileText, GitBranch, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations("Landing");

  const features = [
    {
      icon: BookOpen,
      title: t("features.tradingJournal.title"),
      description: t("features.tradingJournal.description"),
    },
    {
      icon: CalendarClock,
      title: t("features.dailyRoutine.title"),
      description: t("features.dailyRoutine.description"),
    },
    {
      icon: FileText,
      title: t("features.knowledgeBase.title"),
      description: t("features.knowledgeBase.description"),
    },
    {
      icon: AlertTriangle,
      title: t("features.mistakesPsychology.title"),
      description: t("features.mistakesPsychology.description"),
    },
    {
      icon: Wallet,
      title: t("features.accountsManagement.title"),
      description: t("features.accountsManagement.description"),
    },
    {
      icon: Activity,
      title: t("features.smartDatabases.title"),
      description: t("features.smartDatabases.description"),
    },
    {
      icon: GitBranch,
      title: t("features.tradingSystem.title"),
      description: t("features.tradingSystem.description"),
    },
  ];

  return (
    <section id="workspace" className="scroll-mt-15 py-20 px-6">
      <div className="max-w-270 mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">{t("workspace")}</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">
            {t("everythingTrader.title")}
          </h2>
          <p className="mt-3 text-sm text-ink-secondary max-w-120 mx-auto leading-relaxed">
            {t("everythingTrader.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          {features.map(({ icon: Icon, title, description }, index) => (
            <Card
              key={title}
              className={`group flex flex-col gap-4 hover:border-ink-muted transition-colors duration-150 ${
                index < 4 ? "lg:col-span-3" : "lg:col-span-4"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                <Icon size={17} className="text-ink-secondary group-hover:text-accent transition-colors duration-150" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
