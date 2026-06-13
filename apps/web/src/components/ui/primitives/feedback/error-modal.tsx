"use client";

import { Button } from "@/components/ui/primitives/actions/button";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ErrorModalProps {
  messages: string[];
  onClose: () => void;
}

export function ErrorModal({ messages, onClose }: ErrorModalProps) {
  const t = useTranslations();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50" onClick={onClose}>
      <div className="w-96 bg-elevated border border-stroke rounded-2xl shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-error shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{t("GlobalError.title")}</p>
            <ul className="mt-1.5 space-y-1 list-disc list-inside">
              {messages.map((message, i) => (
                <li key={i} className="text-sm text-ink-secondary leading-relaxed">
                  {message}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-center px-5 pb-5">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("UI.close")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
