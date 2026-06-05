"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/primitives/actions/button";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "fixspace_cookie_consent";

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-8 md:max-w-md"
        >
          <div className="bg-elevated border border-stroke rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-accent/10 rounded-lg text-accent shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-ink leading-none">{t("title")}</h3>
                <p className="text-ink-secondary text-sm leading-relaxed mt-2">{t("description")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={handleDecline}>
                {t("decline")}
              </Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={handleAccept}>
                {t("accept")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
