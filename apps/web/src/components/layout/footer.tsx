"use client";

import { Logo } from "@/components/ui/brand/logo";
import { useAppContext } from "@/context/app-context";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const { user } = useAppContext();
  const t = useTranslations("Footer");

  if (user) return null;

  return (
    <footer className="px-6 py-8 border-t border-stroke bg-canvas">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mx-auto max-w-180">
        <div className="flex flex-col gap-4">
          <Logo size={24} />
          <span className="text-sm text-ink-secondary">Diploma project · {new Date().getFullYear()}</span>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="type-nav-label">{t("legal")}</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/privacy" className="text-sm text-ink-secondary hover:text-ink transition-colors duration-150">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="text-sm text-ink-secondary hover:text-ink transition-colors duration-150">
              {t("terms")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
