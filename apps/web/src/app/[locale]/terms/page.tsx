import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header/landing/header";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  const t = useTranslations("TermsOfService");

  const sectionIndices = ["0", "1", "2", "3", "4", "5", "6"];

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header hideNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20 text-ink">
        <div className="flex flex-col gap-12 animate-fade-up">
          <header className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-xs text-ink-muted uppercase tracking-widest font-medium">{t("lastUpdated")}</p>
          </header>

          <div className="flex flex-col gap-10">
            <p className="text-base leading-relaxed opacity-90">{t("agreement")}</p>

            <div className="flex flex-col gap-12">
              {sectionIndices.map((index) => (
                <section key={index} className="flex flex-col gap-4 border-l-2 border-stroke pl-6 py-1">
                  <h2 className="text-xl font-bold tracking-tight">{t(`sections.${index}.title`)}</h2>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-ink-secondary leading-relaxed">{t(`sections.${index}.description`)}</p>
                    <ul className="flex flex-col gap-3">
                      {[0, 1, 2, 3, 4].map((itemIdx) => {
                        const itemKey = `sections.${index}.items.${itemIdx}`;
                        const translatedText = t(itemKey);
                        if (translatedText === itemKey) return null;

                        return (
                          <li key={itemIdx} className="flex gap-3 text-sm text-ink-secondary leading-relaxed group">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 transition-transform group-hover:scale-125" />
                            <span>{translatedText}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>
              ))}
            </div>
          </div>

          <footer className="mt-8 pt-8 border-t border-stroke text-xs text-ink-muted italic">
            © 2026 FIX Space. All rights reserved.
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
