import { LogoIcon } from "@/components/ui/brand/logo";
import { Button } from "@/components/ui/primitives/actions/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function CtaSection() {
  const t = useTranslations("Landing");

  return (
    <div className="bg-surface border border-stroke rounded-[24px] px-8 py-12 max-w-270 mx-auto flex flex-col items-center gap-6 text-center relative overflow-hidden shadow-xl">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mb-1 relative z-10">
        <LogoIcon size={36} />
      </div>

      <div className="relative z-10 max-w-xl">
        <h2 className="type-landing-title-lg">{t("cta.title")}</h2>
        <p className="mt-4 type-landing-body-lg">{t("cta.description")}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 relative z-10">
        <Link href="/register">
          <Button variant="primary" size="md" className="h-12 px-8 type-landing-h4 shadow-lg shadow-accent/10">
            {t("cta.createAccount")}
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="md" className="h-12 px-8 type-landing-h4">
            {t("cta.signIn")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
