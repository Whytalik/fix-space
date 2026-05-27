"use client";

import { routing, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

interface LanguageSwitcherProps {
  variant?: "tabs" | "buttons";
}

export function LanguageSwitcher({ variant = "tabs" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function onLanguageChange(newLocale: string) {
    router.replace(
      // @ts-expect-error - next-intl navigation types
      { pathname, params },
      { locale: newLocale },
    );
  }

  if (variant === "tabs") {
    return (
      <div className="flex items-center gap-1">
        {routing.locales.map((code) => {
          const isActive = locale === code;
          return (
            <button
              key={code}
              onClick={() => onLanguageChange(code)}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors duration-150 ${
                isActive ? "text-ink bg-elevated" : "text-ink-secondary hover:text-ink hover:bg-elevated/50"
              }`}
            >
              {code.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => onLanguageChange(l)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 transition-all duration-150 cursor-pointer ${
            locale === l
              ? "border-accent bg-accent/10 text-accent"
              : "border-stroke bg-surface text-ink-secondary hover:border-stroke-subtle hover:bg-hover hover:text-ink"
          }`}
        >
          <span className="text-sm font-medium">{l === "uk" ? "Українська" : "English"}</span>
        </button>
      ))}
    </div>
  );
}
