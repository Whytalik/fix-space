import { LogoIcon } from "@/components/ui/brand/logo";
import { Button } from "@/components/ui/primitives/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function CtaSection() {
  const t = useTranslations("Landing");

  return (
    <section className="py-24 px-6">
      <div className="bg-surface border border-stroke rounded-2xl px-10 py-14 max-w-155 mx-auto flex flex-col items-center gap-5 text-center">
        <LogoIcon size={40} />

        <div>
          <h2 className="text-[clamp(26px,4vw,38px)] font-bold tracking-[-0.04em] text-ink">{t("cta.title")}</h2>
          <p className="mt-3 text-sm text-ink-secondary max-w-sm mx-auto">{t("cta.description")}</p>
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
          <Link href="/register">
            <Button variant="primary">{t("cta.createAccount")}</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">{t("cta.signIn")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
