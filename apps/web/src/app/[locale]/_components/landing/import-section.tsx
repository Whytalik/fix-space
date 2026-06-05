import { LogoIcon } from "@/components/ui/brand/logo";
import { BarChart2, ChevronRight, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";

export function ImportSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

  const sources = [
    { icon: BarChart2, label: "MetaTrader 4" },
    { icon: BarChart2, label: "MetaTrader 5" },
    { icon: Layers, label: "Binance" },
    { icon: Layers, label: "Bybit" },
  ];

  const importItems = [t("allTradesSynced"), t("autoPnLCalculation"), t("linkedToJournal")];

  return (
    <>
      <SectionHeader
        eyebrow={tNav("import")}
        title={t("automaticImport.title")}
        description={t("automaticImport.description")}
        descriptionClassName="max-w-115"
      />

      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-center gap-6 lg:gap-16 max-w-270 mx-auto mt-12">
        <div className="grid grid-cols-2 md:flex md:flex-col gap-3">
          {sources.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-5 py-4 rounded-xl border border-stroke bg-surface hover:border-accent/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                <Icon size={18} className="text-ink-secondary" />
              </div>
              <div>
                <p className="type-landing-body-muted font-semibold leading-none">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:flex flex-col items-center justify-around py-4 h-full">
          <div className="w-px h-full bg-gradient-to-b from-transparent via-stroke to-transparent relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-canvas p-1.5 border border-stroke rounded-full">
              <ChevronRight size={16} className="text-ink-muted rotate-90 md:rotate-0" />
            </div>
          </div>
        </div>
        <div className="flex md:hidden items-center justify-center gap-2 text-stroke py-4">
          <div className="h-px flex-1 bg-stroke" />
          <span className="type-landing-eyebrow-subtle px-3">{tNav("import")}</span>
          <div className="h-px flex-1 bg-stroke" />
        </div>
        <div className="flex flex-col items-center justify-center gap-5 px-8 py-10 rounded-2xl border border-accent/50 bg-accent/5 self-stretch shadow-2xl shadow-accent/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <LogoIcon size={40} className="relative z-10" />
          <div className="text-center relative z-10">
            <p className="type-landing-h3 tracking-tight">FIX Space</p>
            <p className="type-landing-eyebrow mt-1">{t("unifiedWorkspace")}</p>
          </div>
          <div className="w-full h-px bg-accent/20 relative z-10" />
          <div className="flex flex-col gap-2.5 w-full relative z-10">
            {importItems.map((item) => (
              <div key={item} className="flex items-center gap-2.5 type-landing-body-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 shadow-lg shadow-accent/50" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
