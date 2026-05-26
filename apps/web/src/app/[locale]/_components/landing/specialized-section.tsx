import { LogoIcon } from "@/components/ui/brand/logo";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function SpecializedSection() {
  const t = useTranslations("Landing");

  return (
    <section id="focus" className="scroll-mt-15 py-20 px-6">
      <div className="max-w-270 mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">{t("focus")}</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-[-0.04em] text-ink">
            {t("builtForTraders.title")}
          </h2>
          <p className="mt-4 text-sm text-ink-secondary max-w-140 mx-auto leading-relaxed">
            {t("builtForTraders.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Generic tools */}
          <div className="bg-surface border border-stroke rounded-xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📄</span>
              <div>
                <p className="text-sm font-bold text-ink">{t("notionGoogleSheets")}</p>
                <p className="text-xs text-ink-muted mt-0.5">{t("genericTools")}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>{t("noTradingModel")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>{t("noNativeConcepts")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>{t("noBrokerImport")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>{t("fullyFlexible")}</span>
              </li>
            </ul>
          </div>

          {/* Specialized journals */}
          <div className="bg-surface border border-stroke rounded-xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📊</span>
              <div>
                <p className="text-sm font-bold text-ink">{t("specializedJournals")}</p>
                <p className="text-xs text-ink-muted mt-0.5">{t("exampleGeneric")}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>{t("readyDataModel")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>{t("autoImport")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>{t("fixedStructure")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink-secondary">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>{t("paidOnly")}</span>
              </li>
            </ul>
          </div>

          {/* FIX Space */}
          <div className="bg-surface border border-accent rounded-xl p-7 ring-4 ring-accent-muted">
            <div className="flex items-center gap-3 mb-5">
              <LogoIcon size={22} />
              <div>
                <p className="text-sm font-bold text-ink">FIX Space</p>
                <p className="text-xs text-ink-muted mt-0.5">{t("purposeBuilt")}</p>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-xs">
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>{t("FIX SpaceDescription")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>{t("advancedRelations")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>{t("richMedia")}</span>
              </li>
              <li className="flex items-start gap-2 text-ink">
                <CheckCircle size={13} className="text-success shrink-0 mt-0.5" />
                <span>{t("fullyCustomizable")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
