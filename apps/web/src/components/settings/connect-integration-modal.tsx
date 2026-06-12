"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
  type IntegrationService,
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

  const metadata = INTEGRATION_METADATA[service];

  const updateField = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const mutation = useMutation({
    mutationFn: () => {
      const credentials = form as unknown as ExchangeCredentials | Mt5Credentials;

      if (isReconnect) {
        return updateIntegrationConnection(existing.id, { credentials: { ...credentials, service }, name, spaceId });
      }
      return createIntegrationConnection({ service, name, spaceId, credentials: { ...credentials, service } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrationConnections.all() });
      onClose();
    },
  });

  const isFormValid = () => {
    if (!name.trim()) return false;
    if (!spaceId) return false;
    return metadata.fields.every((f) => !!form[f.id]);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={isReconnect ? t("reconnect") : t("connectService", { service: metadata.label })}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
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
