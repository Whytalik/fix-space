"use client";

import { Button } from "@/components/ui/primitives/actions/button";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import "../globals.css";

function getLocale(): "en" | "uk" {
  if (typeof navigator !== "undefined" && navigator.language?.startsWith("uk")) return "uk";
  return "en";
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("GlobalError");
  return (
    <html lang={getLocale()} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-canvas text-ink h-screen flex flex-col">
        <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6 text-center">
          <AlertTriangle size={40} className="text-error" />

          <div className="flex flex-col gap-2">
            <h1 className="text-[clamp(28px,5vw,42px)] font-extrabold tracking-[-0.04em] text-ink leading-none">{t("title")}</h1>
            <p className="text-sm text-ink-secondary max-w-72 leading-relaxed">{t("description")}</p>
            {error.digest && <p className="text-xs text-ink-muted mt-2">Digest: {error.digest}</p>}
          </div>

          <div className="flex items-center gap-3 w-full max-w-50">
            <div className="flex-1 h-px bg-stroke" />
            <span className="text-xs font-semibold tracking-widest text-ink-muted uppercase">{t("error")}</span>
            <div className="flex-1 h-px bg-stroke" />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={reset}>{t("tryAgain")}</Button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-elevated border border-stroke text-ink text-sm font-semibold transition-colors duration-150 hover:bg-hover"
            >
              {t("goWorkspace")}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
