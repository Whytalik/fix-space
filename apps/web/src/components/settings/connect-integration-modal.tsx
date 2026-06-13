"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { FormField } from "@/components/ui/form/form-field";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { useAppContext } from "@/context/app-context";
import { createIntegrationConnection, updateIntegrationConnection } from "@/lib/api/integration-connection";
import { queryKeys } from "@/lib/api/query-keys";
import {
  type ExchangeCredentials,
  INTEGRATION_METADATA,
  type IntegrationConnectionResponseDto,
  IntegrationService,
  type Mt5Credentials,
} from "@fixspace/domain";

type CredentialValues = Record<string, string>;

interface ConnectIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: IntegrationService;
  existing?: IntegrationConnectionResponseDto;
}

export function ConnectIntegrationModal({ isOpen, onClose, service, existing }: ConnectIntegrationModalProps) {
  const t = useTranslations("IntegrationSettingsComp");
  const queryClient = useQueryClient();
  const { spaces, space: currentSpace } = useAppContext();

  const isReconnect = !!existing;
  const [name, setName] = useState(existing?.name ?? "");
  const [spaceId, setSpaceId] = useState(existing?.spaceId ?? currentSpace?.id ?? "");
  const [form, setForm] = useState<CredentialValues>({});

  // State for MT5 success screen
  const [mt5Result, setMt5Result] = useState<IntegrationConnectionResponseDto | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const metadata = INTEGRATION_METADATA[service];

  const updateField = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const mutation = useMutation({
    mutationFn: () => {
      const credentials = form as unknown as ExchangeCredentials | Mt5Credentials;

      if (isReconnect) {
        return updateIntegrationConnection(existing.id, { credentials: { ...credentials, service }, name, spaceId });
      }
      return createIntegrationConnection({ service, name, spaceId, credentials: { ...credentials, service } });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrationConnections.all() });
      if (service === IntegrationService.METATRADER5 && !isReconnect) {
        setMt5Result(data);
      } else {
        onClose();
      }
    },
  });

  const isFormValid = () => {
    if (!name.trim()) return false;
    if (!spaceId) return false;
    return metadata.fields.every((f) => !!form[f.id]);
  };

  const handleClose = () => {
    setMt5Result(null);
    onClose();
  };

  // MT5 Success Screen (Instructions)
  if (mt5Result) {
    const apiToken = mt5Result.apiToken ?? "Error: Token not found";
    const webhookUrl = `${window.location.origin}/api/integration-connections/mt5/webhook`;

    return (
      <ModalShell
        isOpen={isOpen}
        onClose={handleClose}
        title={t("mt5ConnectionCreated", { fallback: "MetaTrader 5 Connected!" })}
        size="lg"
        footer={
          <div className="flex justify-end w-full">
            <Button onClick={handleClose}>{t("done", { fallback: "Done" })}</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 text-sm">
          <p className="text-ink-secondary">
            {t.rich("mt5InstructionsDesc", {
              fallback:
                "Your connection is ready. To start syncing trades, download the <link>FixSpaceSync</link> Expert Advisor and configure it in your MT5 terminal:",
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
                <code className="flex-1 p-2 bg-surface border border-stroke rounded-lg text-xs break-all">{mt5Result.id}</code>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => copyToClipboard(mt5Result.id, "id")}>
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
              <p className="text-xs text-ink-muted mt-1">
                {t("mt5ApiTokenWarning", { fallback: "Copy this token now. It will not be shown again." })}
              </p>
            </div>
          </div>

          <div className="text-xs text-ink-secondary mt-2 space-y-1">
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

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isReconnect ? t("reconnect") : t("connectService", { service: metadata.label })}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} type="button">
            {t("cancel")}
          </Button>
          <Button type="button" loading={mutation.isPending} disabled={!isFormValid()} onClick={() => mutation.mutate()}>
            {isReconnect ? t("reconnect") : t("connect")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField
          id="conn-name"
          label={t("connectionName")}
          placeholder={t("connectionNamePlaceholder", { service: metadata.label })}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="type-form-label">{t("space")}</label>
          <Combobox
            options={spaces.map((s) => ({ value: s.id, label: s.name, icon: s.icon }))}
            value={spaceId}
            onChange={(val) => setSpaceId(val)}
            placeholder={t("space")}
          />
        </div>

        {service === IntegrationService.METATRADER5 && (
          <p className="text-sm text-ink-secondary p-3 bg-canvas border border-stroke rounded-2xl">
            {t("mt5CreationNotice", {
              fallback:
                "After creating the connection, you will receive a Connection ID and an API Token to enter into your MetaTrader 5 terminal.",
            })}
          </p>
        )}

        {metadata.fields.map((field) => (
          <FormField
            key={field.id}
            id={field.id}
            label={t(field.labelKey)}
            placeholder={t(field.placeholderKey)}
            type={field.type}
            value={form[field.id] ?? ""}
            onChange={(e) => updateField(field.id, e.target.value)}
            autoComplete="off"
          />
        ))}

        {mutation.isError && <p className="text-sm text-error">{t("connectionError")}</p>}
      </div>
    </ModalShell>
  );
}
