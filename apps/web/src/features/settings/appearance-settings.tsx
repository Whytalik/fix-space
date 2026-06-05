"use client";

import type { Theme } from "@/context/theme-context";
import { useTheme } from "@/context/theme-context";
import { LanguageSwitcher } from "@/components/layout/header/landing/language-switcher";
import { Moon, Sun, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Settings");

  const themeOptions: { id: Theme; label: string; icon: LucideIcon }[] = [
    { id: "light", label: t("appearance.theme.light"), icon: Sun },
    { id: "dark", label: t("appearance.theme.dark"), icon: Moon },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-ink">{t("appearance.theme.title")}</h3>
        <p className="mt-1 text-sm text-ink-secondary">{t("appearance.theme.description")}</p>

        <div className="mt-4 flex gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 transition-all duration-150 cursor-pointer ${
                theme === option.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-stroke bg-surface text-ink-secondary hover:border-stroke-subtle hover:bg-hover hover:text-ink"
              }`}
            >
              <option.icon size={15} />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-stroke">
        <h3 className="text-sm font-medium text-ink">{t("appearance.language.title")}</h3>
        <p className="mt-1 text-sm text-ink-secondary">{t("appearance.language.description")}</p>
        <div className="mt-4">
          <LanguageSwitcher variant="buttons" />
        </div>
      </div>
    </div>
  );
}
