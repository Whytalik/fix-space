import { useTranslations } from "next-intl";
import { BarChart3, TrendingUp, Upload } from "lucide-react";

export function HowItWorksSection() {
  const t = useTranslations("Landing");

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
    <section id="workflow" className="scroll-mt-15 py-20 px-6">
      <div className="max-w-270 mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">{t("workflow")}</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">{t("howItWorks.title")}</h2>
          <p className="mt-3 text-sm text-ink-secondary max-w-110 mx-auto leading-relaxed">
            {t("howItWorks.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-ink-muted tabular-nums">{number}</span>
                <div className="w-px h-4 bg-stroke" />
                <Icon size={17} className="text-accent" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-ink-secondary leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
