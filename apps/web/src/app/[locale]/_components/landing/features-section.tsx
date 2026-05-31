import { Card } from "@/components/ui/primitives/display/card";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  CalendarClock,
  CalendarRange,
  FileText,
  GitBranch,
  Library,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";

export function FeaturesSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

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
      icon: CalendarRange,
      title: t("features.performanceReview.title"),
      description: t("features.performanceReview.description"),
    },
    {
      icon: AlertTriangle,
      title: t("features.mistakes.title"),
      description: t("features.mistakes.description"),
    },
    {
      icon: FileText,
      title: t("features.notes.title"),
      description: t("features.notes.description"),
    },
    {
      icon: Library,
      title: t("features.routineLibrary.title"),
      description: t("features.routineLibrary.description"),
    },
    {
      icon: GitBranch,
      title: t("features.tradingSystem.title"),
      description: t("features.tradingSystem.description"),
    },
    {
      icon: Wallet,
      title: t("features.accounts.title"),
      description: t("features.accounts.description"),
    },
    {
      icon: ArrowLeftRight,
      title: t("features.operations.title"),
      description: t("features.operations.description"),
    },
  ];

  return (
    <>
      <SectionHeader
        eyebrow={tNav("features")}
        title={t("everythingTrader.title")}
        description={t("everythingTrader.description")}
        mb="mb-12"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full mb-2">
          <h3 className="type-landing-eyebrow flex items-center gap-3">
            <span className="shrink-0">{t("everythingTrader.group1")}</span>
            <div className="h-px w-full bg-stroke/50" />
          </h3>
        </div>
        {features.slice(0, 3).map(({ icon: Icon, title, description }) => (
          <Card key={title} className="group flex flex-col gap-4 hover:border-accent/30 transition-colors duration-150">
            <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
              <Icon size={17} className="text-ink-secondary group-hover:text-accent transition-colors duration-150" />
            </div>
            <div>
              <h4 className="type-landing-h4">{title}</h4>
              <p className="mt-1.5 type-landing-body-muted">{description}</p>
            </div>
          </Card>
        ))}

        <div className="col-span-full mt-6 mb-2">
          <h3 className="type-landing-eyebrow flex items-center gap-3">
            <span className="shrink-0">{t("everythingTrader.group2")}</span>
            <div className="h-px w-full bg-stroke/50" />
          </h3>
        </div>
        {features.slice(3, 6).map(({ icon: Icon, title, description }) => (
          <Card key={title} className="group flex flex-col gap-4 hover:border-accent/30 transition-colors duration-150">
            <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
              <Icon size={17} className="text-ink-secondary group-hover:text-accent transition-colors duration-150" />
            </div>
            <div>
              <h4 className="type-landing-h4">{title}</h4>
              <p className="mt-1.5 type-landing-body-muted">{description}</p>
            </div>
          </Card>
        ))}

        <div className="col-span-full mt-6 mb-2">
          <h3 className="type-landing-eyebrow flex items-center gap-3">
            <span className="shrink-0">{t("everythingTrader.group3")}</span>
            <div className="h-px w-full bg-stroke/50" />
          </h3>
        </div>
        {features.slice(6, 9).map(({ icon: Icon, title, description }) => (
          <Card key={title} className="group flex flex-col gap-4 hover:border-accent/30 transition-colors duration-150">
            <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
              <Icon size={17} className="text-ink-secondary group-hover:text-accent transition-colors duration-150" />
            </div>
            <div>
              <h4 className="type-landing-h4">{title}</h4>
              <p className="mt-1.5 type-landing-body-muted">{description}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
