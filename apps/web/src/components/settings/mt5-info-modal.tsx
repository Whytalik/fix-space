"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import type { IntegrationConnectionResponseDto } from "@fixspace/domain";

interface Mt5InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: IntegrationConnectionResponseDto;
}

export function Mt5InfoModal({ isOpen, onClose, connection }: Mt5InfoModalProps) {
  const t = useTranslations("IntegrationSettingsComp");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const webhookUrl = `${window.location.origin}/api/integration-connections/mt5/webhook`;
  const apiToken = connection.apiToken ?? t("mt5TokenNotAvailable", { fallback: "Token not found" });

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("mt5InfoTitle", { fallback: "MetaTrader 5 Connection Details" })}
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button onClick={onClose}>{t("done", { fallback: "Done" })}</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-ink-secondary">
          {t.rich("mt5InfoDesc", {
            fallback: "Use the credentials below to configure the <link>FixSpaceSync</link> Expert Advisor in your MetaTrader 5 terminal:",
            link: (chunks) => (
              <a
                href="/FixSpaceSync.mq5"
                download
                className="text-accent underline font-medium hover:text-accent/80 transition-colors duration-150"
              >
                {chunks}
              </a>
            ),
          })}
        </p>

        <div className="flex flex-col gap-3 p-4 bg-canvas border border-stroke rounded-2xl">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink-secondary">{t("mt5ApiUrl", { fallback: "Webhook API URL" })}</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-surface border border-stroke rounded-lg text-xs break-all">{webhookUrl}</code>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => copyToClipboard(webhookUrl, "url")}>
                {copiedField === "url" ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-medium text-ink-secondary">{t("mt5ConnectionId", { fallback: "Connection ID" })}</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-surface border border-stroke rounded-lg text-xs break-all">{connection.id}</code>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => copyToClipboard(connection.id, "id")}>
                {copiedField === "id" ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-medium text-warning">{t("mt5ApiToken", { fallback: "API Token (Secret)" })}</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-surface border border-stroke rounded-lg text-xs break-all">{apiToken}</code>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => copyToClipboard(apiToken, "token")}>
                {copiedField === "token" ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-ink-secondary mt-2 space-y-1">
          <h4 className="font-semibold mb-1 text-ink">{t("mt5InstructionsTitle", { fallback: "Instructions:" })}</h4>
          <p>
            1.{" "}
            {t.rich("mt5InstructionStep1", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <p>2. {t("mt5InstructionStep2")}</p>
          <p>
            3.{" "}
            {t.rich("mt5InstructionStep3", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <div className="flex justify-between items-center text-xs mt-4 pt-3 border-t border-stroke">
            <a
              href="/instructions/mt5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline flex items-center gap-1 font-medium transition-colors duration-150"
            >
              <span>{t("viewFullInstructions", { fallback: "View Full Setup Guide" })}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
