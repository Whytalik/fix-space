"use client";

import "../globals.css";
import { Button } from "@/components/ui/primitives/button";

const translations = {
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. You can try again or return to your workspace.",
    error: "Error",
    tryAgain: "Try again",
    goWorkspace: "Go to workspace",
  },
  uk: {
    title: "Щось пішло не так",
    description: "Сталася неочікувана помилка. Ви можете спробувати ще раз або повернутися до робочого простору.",
    error: "Помилка",
    tryAgain: "Спробувати ще раз",
    goWorkspace: "Перейти до робочого простору",
  },
} as const;

function getLocale(): "en" | "uk" {
  if (typeof navigator !== "undefined" && navigator.language?.startsWith("uk")) return "uk";
  return "en";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = translations[getLocale()];
  return (
    <html lang={getLocale()}>
      <body className="h-screen flex flex-col">
        <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-error"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>

          <div className="flex flex-col gap-2">
            <h1 className="text-[clamp(28px,5vw,42px)] font-extrabold tracking-[-0.04em] text-ink leading-none">
              {t.title}
            </h1>
            <p className="text-sm text-ink-secondary max-w-72 leading-relaxed">{t.description}</p>
          </div>

          <div className="flex items-center gap-3 w-full max-w-50">
            <div className="flex-1 h-px bg-stroke" />
            <span className="text-xs font-semibold tracking-widest text-ink-muted uppercase">{t.error}</span>
            <div className="flex-1 h-px bg-stroke" />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={reset}>{t.tryAgain}</Button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="px-5 py-2.5 rounded-lg bg-elevated border border-stroke text-ink text-sm font-semibold transition-colors duration-150 hover:bg-hover"
            >
              {t.goWorkspace}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
