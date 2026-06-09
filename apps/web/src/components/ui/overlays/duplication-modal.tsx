"use client";

import { Button } from "@/components/ui/primitives/actions/button";
import { CheckboxInput } from "@/components/ui/primitives/inputs/checkbox-input";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { ModalShell } from "./modal-shell";
import { useTranslations } from "next-intl";
import { useState } from "react";

export type DuplicationTarget = "workspace" | "database" | "section";

export interface DuplicationOptions {
  newName: string;
  includeSections?: boolean;
  includeDatabases?: boolean;
  includeProperties?: boolean;
  includeTemplates?: boolean;
  includeAutomations?: boolean;
  includeRecords?: boolean;
}

interface DuplicationModalProps {
  target: DuplicationTarget;
  initialName: string;
  onConfirm: (options: DuplicationOptions) => Promise<void>;
  onCancel: () => void;
}

export function DuplicationModal({ target, initialName, onConfirm, onCancel }: DuplicationModalProps) {
  const t = useTranslations("DuplicationModal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<DuplicationOptions>({
    newName: initialName,
    includeSections: true,
    includeDatabases: true,
    includeProperties: true,
    includeTemplates: true,
    includeAutomations: true,
    includeRecords: false,
  });

  async function handleConfirm() {
    if (!options.newName.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(options);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell isOpen={true} onClose={onCancel} title={t("title", { type: t(`types.${target}`) })}>
      <div className="flex flex-col gap-6 p-6 min-w-[360px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="type-field-label">{t("newName")}</label>
            <TextInput value={options.newName} onChange={(value) => setOptions((prev) => ({ ...prev, newName: value }))} />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {target === "workspace" && (
              <CheckboxInput
                label={t("includeSections")}
                checked={options.includeSections ?? false}
                onChange={(value) => setOptions((prev) => ({ ...prev, includeSections: value }))}
              />
            )}

            {(target === "workspace" || target === "section") && (
              <CheckboxInput
                label={t("includeDatabases")}
                checked={options.includeDatabases ?? false}
                onChange={(value) => setOptions((prev) => ({ ...prev, includeDatabases: value }))}
              />
            )}

            <CheckboxInput
              label={t("includeProperties")}
              checked={options.includeProperties ?? false}
              onChange={(value) => setOptions((prev) => ({ ...prev, includeProperties: value }))}
            />

            <CheckboxInput
              label={t("includeTemplates")}
              checked={options.includeTemplates ?? false}
              onChange={(value) => setOptions((prev) => ({ ...prev, includeTemplates: value }))}
            />

            <CheckboxInput
              label={t("includeAutomations")}
              checked={options.includeAutomations ?? false}
              onChange={(value) => setOptions((prev) => ({ ...prev, includeAutomations: value }))}
            />

            {target === "database" && (
              <CheckboxInput
                label={t("includeRecords")}
                checked={options.includeRecords ?? false}
                onChange={(value) => setOptions((prev) => ({ ...prev, includeRecords: value }))}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || !options.newName.trim()}>
            {isSubmitting ? t("duplicating") : t("duplicate")}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
