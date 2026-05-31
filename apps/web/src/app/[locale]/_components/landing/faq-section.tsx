"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "./section-header";
import { ChevronDown, Info, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FaqSection() {
  const t = useTranslations("Landing.faq");
  const [openCategoryId, setOpenCategoryId] = useState<string | null>("0");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

  const categories = [
    { key: "0", items: [0, 1, 2], icon: Info },
    { key: "1", items: [0, 1, 2, 3], icon: Zap },
    { key: "2", items: [0, 1, 2], icon: ShieldCheck },
  ];

  const toggleCategory = (key: string) => {
    setOpenCategoryId(openCategoryId === key ? null : key);
  };

  return (
    <div className="w-full max-w-270 mx-auto px-6 relative">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} mb="mb-20" />

      <div className="max-w-3xl mx-auto flex flex-col gap-8 relative z-10">
        {categories.map((cat) => {
          const isCatOpen = openCategoryId === cat.key;
          const Icon = cat.icon;

          return (
            <div key={cat.key} className="flex flex-col">
              <button
                onClick={() => toggleCategory(cat.key)}
                aria-expanded={isCatOpen}
                className="group flex items-center justify-between py-2 text-left transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 ${
                      isCatOpen
                        ? "bg-accent/10 border-accent/40 text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]"
                        : "bg-surface border-stroke text-ink-muted group-hover:border-ink-muted"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <h3
                    className={`type-landing-eyebrow-lg transition-colors duration-300 ${
                      isCatOpen ? "text-ink" : "group-hover:text-ink"
                    }`}
                  >
                    {t(`categories.${cat.key}.title`)}
                  </h3>
                </div>
                <div
                  className={`text-ink-muted transition-transform duration-500 ${isCatOpen ? "rotate-180 text-accent" : ""}`}
                >
                  <ChevronDown size={14} />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isCatOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 mt-6 mb-8 pl-12 border-l border-stroke/50 ml-4">
                      {cat.items.map((itemIdx) => {
                        const id = `${cat.key}-${itemIdx}`;
                        const isQuestionOpen = openQuestionId === id;

                        return (
                          <div
                            key={id}
                            className={`group rounded-2xl border transition-all duration-300 ${
                              isQuestionOpen
                                ? "border-accent/40 bg-surface/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]"
                                : "border-stroke/60 bg-surface/20 hover:border-stroke hover:bg-surface/30"
                            }`}
                          >
                            <button
                              onClick={() => setOpenQuestionId(isQuestionOpen ? null : id)}
                              aria-expanded={isQuestionOpen}
                              className="w-full flex items-center justify-between px-6 py-4.5 text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {isQuestionOpen && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-accent">
                                    <Sparkles size={14} />
                                  </motion.div>
                                )}
                                <span
                                  className={`type-landing-faq-q transition-colors duration-300 ${
                                    isQuestionOpen ? "text-ink" : "group-hover:text-ink"
                                  }`}
                                >
                                  {t(`categories.${cat.key}.items.${itemIdx}.q`)}
                                </span>
                              </div>
                              <div
                                className={`shrink-0 transition-transform duration-300 ${isQuestionOpen ? "rotate-180 text-accent" : "text-ink-muted"}`}
                              >
                                <ChevronDown size={14} />
                              </div>
                            </button>

                            <AnimatePresence>
                              {isQuestionOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-6 pt-0 type-landing-faq-a">
                                    <div className="h-px w-8 bg-accent/20 mb-4" />
                                    {t(`categories.${cat.key}.items.${itemIdx}.a`)}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
