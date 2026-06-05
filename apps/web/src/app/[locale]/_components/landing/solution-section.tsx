import { LogoIcon } from "@/components/ui/brand/logo";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";

export function SolutionSection() {
  const t = useTranslations("Landing");
  const tNav = useTranslations("LandingNav");

  return (
    <>
      <SectionHeader
        eyebrow={tNav("solution")}
        title={t("solution.title")}
        description={t("solution.description")}
        descriptionClassName="mt-4 max-w-140"
      />

      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-surface border border-accent rounded-xl p-8 ring-4 ring-accent-muted shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-canvas border border-stroke flex items-center justify-center">
              <LogoIcon size={24} />
            </div>
            <div>
              <h3 className="type-landing-h2">FIX Space</h3>
              <p className="type-landing-eyebrow mt-0.5">Purpose-built & flexible</p>
            </div>
          </div>

          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
              <span className="type-landing-body-muted">{t("solution.FIX SpaceDescription")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
              <span className="type-landing-body-muted">{t("solution.advancedRelations")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
              <span className="type-landing-body-muted">{t("solution.richMedia")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
              <span className="type-landing-body-muted">{t("solution.fullyCustomizable")}</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
