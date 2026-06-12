"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

interface TokenInfoModalProps {
  onClose: () => void;
}

export function TokenInfoModal({ onClose }: TokenInfoModalProps) {
  const t = useTranslations("TemplateEdit");

  const tokens = [
    {
      token: "{{today}}",
      desc: "Current date in DD.MM.YYYY format",
      example: { before: "Report {{today}}", after: "Report 12.05.2026" },
    },
    {
      token: "{{year}}",
      desc: "Current year",
      example: { before: "Yearly {{year}}", after: "Yearly 2026" },
    },
    {
      token: "{{month}}",
      desc: "Current month index (01-12)",
      example: { before: "M-{{month}}", after: "M-05" },
    },
    {
      token: "{{count}}",
      desc: "Total record count in database + 1",
      example: { before: "#{{count}}", after: "#157" },
    },
    {
      token: "{{count:Prop=Value}}",
      desc: "Count of records where Prop equals Value + 1",
      example: { before: "Order-{{count:Status=Paid}}", after: "Order-43" },
    },
  ];

  return (
    <ModalShell isOpen onClose={onClose} title={t("tokensInfoTitle")} size="md">
      <div className="p-6 space-y-6">
        <p className="text-sm text-ink-secondary leading-relaxed">{t("tokensInfoDesc")}</p>

        <div className="divide-y divide-stroke-subtle border-y border-stroke-subtle">
          {tokens.map((item) => (
            <div key={item.token} className="py-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <code className="text-sm font-bold text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20">{item.token}</code>
                <span className="text-xs text-ink-muted italic">{item.desc}</span>
              </div>
              <div className="flex items-center gap-3 text-xs bg-surface p-2.5 rounded-lg border border-stroke">
                <div className="flex-1 min-w-0">
                  <span className="block text-ink-muted mb-1 uppercase tracking-widest font-bold text-[9px]">Input</span>
                  <span className="text-ink-secondary font-mono truncate block">{item.example.before}</span>
                </div>
                <ArrowRight size={14} className="text-ink-muted shrink-0 mt-3" />
                <div className="flex-1 min-w-0">
                  <span className="block text-ink-muted mb-1 uppercase tracking-widest font-bold text-[9px]">Result</span>
                  <span className="text-ink font-mono truncate block">{item.example.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}
