"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header/landing/header";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  const t = useTranslations("TermsOfService");

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header hideNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20">
        <div className="flex flex-col gap-12">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h1>
            <p className="text-xs text-ink-muted">{t("lastUpdated")}</p>
          </header>

          <div className="flex flex-col gap-10">
            <p className="text-base text-ink leading-relaxed">{t("agreement")}</p>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-ink">{t("usageLimits.title")}</h2>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-ink-secondary leading-relaxed">{t("usageLimits.description")}</p>
                <ul className="list-disc list-inside flex flex-col gap-2 text-sm text-ink-secondary">
                  {["0", "1", "2"].map((i) => (
                    <li key={i} className="leading-relaxed">
                      {t(`usageLimits.items.${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-ink">{t("disclaimer.title")}</h2>
              <p className="text-sm text-ink-secondary leading-relaxed">{t("disclaimer.description")}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
