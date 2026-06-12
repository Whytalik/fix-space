"use client";

import { routing, usePathname, useRouter } from "@/i18n/routing";
import { DropdownMenu } from "@/components/ui/overlays/dropdown-menu";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRef, useState } from "react";

export function LanguageSwitcher({ variant }: { variant?: "dropdown" | "buttons" } = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
            type="button"
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
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface transition-all duration-150"
      >
        <Languages size={18} className="text-ink-muted" />
        <span className="type-nav-label">{locale}</span>
      </button>

      {isOpen && (
        <DropdownMenu
          anchorEl={triggerRef.current}
          onClose={() => setIsOpen(false)}
          items={routing.locales.map((locale) => ({
            label: locale === "uk" ? "Українська" : "English",
            icon: <span>{locale === "uk" ? "🇺🇦" : "🇺🇸"}</span>,
            onClick: () => switchLocale(locale),
          }))}
        />
      )}
    </div>
  );
}
