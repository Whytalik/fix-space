"use client";

import { routing, usePathname, useRouter } from "@/i18n/routing";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

export function LanguageSwitcher({ variant }: { variant?: "dropdown" | "buttons" } = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (nextLocale: string) => {
    setIsOpen(false);
    if (locale === nextLocale) return;
    router.replace(pathname, { locale: nextLocale });
  };

  if (variant === "buttons") {
    return (
      <div className="flex gap-3">
        {routing.locales.map((localeOption) => (
          <button
            key={localeOption}
            onClick={() => switchLocale(localeOption)}
            className={`flex flex-1 items-center justify-center py-2.5 border rounded-lg transition-all duration-150 cursor-pointer ${
              locale === localeOption
                ? "border-accent bg-accent/10 text-accent font-bold"
                : "border-stroke bg-surface text-ink-secondary hover:border-stroke-subtle hover:bg-hover hover:text-ink font-semibold"
            }`}
          >
            <span className="text-sm">{localeOption === "uk" ? "🇺🇦 Українська" : "🇺🇸 English"}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface transition-all duration-150"
      >
        <Languages size={18} className="text-ink-muted" />
        <span className="text-[12.5px] font-bold uppercase tracking-wider">{locale}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 bg-elevated border border-stroke rounded-xl shadow-xl py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {routing.locales.map((localeOption) => (
              <button
                key={localeOption}
                onClick={() => switchLocale(localeOption)}
                className={`w-full text-left px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-surface ${
                  locale === localeOption ? "text-accent bg-accent/5" : "text-ink-secondary hover:text-ink"
                }`}
              >
                {localeOption === "uk" ? "🇺🇦 Українська" : "🇺🇸 English"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
