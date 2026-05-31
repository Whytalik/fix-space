import { useTranslations } from "next-intl";
import { BarChart3, TrendingUp, Upload } from "lucide-react";
import { SectionHeader } from "./section-header";

export function HowItWorksSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

  const steps = [
    {
      number: "01",
      icon: Upload,
      title: t("howItWorksSteps.step1.title"),
      description: t("howItWorksSteps.step1.description"),
    },
    {
      number: "02",
      icon: BarChart3,
      title: t("howItWorksSteps.step2.title"),
      description: t("howItWorksSteps.step2.description"),
    },
    {
      number: "03",
      icon: TrendingUp,
      title: t("howItWorksSteps.step3.title"),
      description: t("howItWorksSteps.step3.description"),
    },
  ];

  return (
    <>
      <SectionHeader
        eyebrow={tNav("workflow")}
        title={t("howItWorks.title")}
        description={t("howItWorks.description")}
        descriptionClassName="max-w-110"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {steps.map(({ number, icon: Icon, title, description }) => (
          <div key={number} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="type-landing-body-muted font-mono tabular-nums">{number}</span>
              <div className="w-px h-4 bg-stroke" />
              <Icon size={17} className="text-accent" />
            </div>
            <div>
              <h3 className="type-landing-h3">{title}</h3>
              <p className="mt-2 type-landing-body">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
