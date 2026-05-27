import { LogoIcon } from "@/components/ui/brand/logo";
import { BarChart2, ChevronRight, Layers } from "lucide-react";
import { useTranslations } from "next-intl";

export function ImportSection() {
  const t = useTranslations("Landing");

  const sources = [
    { icon: BarChart2, label: "MetaTrader 4" },
    { icon: BarChart2, label: "MetaTrader 5" },
    { icon: Layers, label: "Binance" },
    { icon: Layers, label: "Bybit" },
  ];

  const importItems = [t("allTradesSynced"), t("autoPnLCalculation"), t("linkedToJournal")];

  return (
    <section id="import" className="scroll-mt-15 py-20 px-6">
      <div className="max-w-270 mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">{t("import")}</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">
            {t("automaticImport.title")}
          </h2>
          <p className="mt-3 text-sm text-ink-secondary max-w-115 mx-auto leading-relaxed">
            {t("automaticImport.description")}
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1.2fr] md:items-center gap-6 md:gap-8 max-w-170 mx-auto">
          <div className="flex flex-col gap-3">
            {sources.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-stroke bg-surface">
                <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-ink-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink leading-none">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex flex-col items-center justify-around py-4">
            {sources.map(({ label }) => (
              <ChevronRight key={label} size={18} className="text-stroke" />
            ))}
          </div>
          <div className="flex md:hidden items-center justify-center gap-2 text-stroke">
            <ChevronRight size={18} />
            <span className="text-xs text-ink-muted font-semibold">{t("importsInto")}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 px-8 py-8 rounded-xl border border-stroke bg-elevated self-stretch">
            <LogoIcon size={36} />
            <div className="text-center">
              <p className="text-base font-bold text-ink tracking-[-0.02em]">FIX Space</p>
              <p className="text-xs text-ink-muted mt-1">{t("unifiedWorkspace")}</p>
            </div>
            <div className="w-full h-px bg-stroke" />
            <div className="flex flex-col gap-1.5 w-full">
              {importItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-ink-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
