import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header/landing/header";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPolicy");

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
            <p className="text-base text-ink leading-relaxed">{t("introduction")}</p>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-ink">{t("dataCollection.title")}</h2>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-ink-secondary leading-relaxed">{t("dataCollection.description")}</p>
                <ul className="list-disc list-inside flex flex-col gap-2 text-sm text-ink-secondary">
                  {["0", "1", "2"].map((i) => (
                    <li key={i} className="leading-relaxed">
                      {t(`dataCollection.items.${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-ink">{t("security.title")}</h2>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-ink-secondary leading-relaxed">{t("security.description")}</p>
                <ul className="list-disc list-inside flex flex-col gap-2 text-sm text-ink-secondary">
                  {["0", "1", "2"].map((i) => (
                    <li key={i} className="leading-relaxed">
                      {t(`security.items.${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-ink">{t("rights.title")}</h2>
              <p className="text-sm text-ink-secondary leading-relaxed">{t("rights.description")}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
