"use client";

import { useState } from "react";
import { Trash2, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AutomationResponseDto } from "@fixspace/domain";
import { useAutomationsQuery } from "@/hooks/api/use-automations-query";
import { useAutomationMutations } from "@/hooks/api/use-automation-mutations";
import { EmptyState } from "@/components/ui/primitives/display/empty-state";
import { Button } from "@/components/ui/primitives/actions/button";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";

interface AutomationListProps {
  databaseId: string;
  onEdit?: (automation: AutomationResponseDto) => void;
}

export function AutomationList({ databaseId, onEdit }: AutomationListProps) {
  const t = useTranslations("Automation");
  const { data: automations, isLoading } = useAutomationsQuery(databaseId);
  const { update, remove } = useAutomationMutations(databaseId);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (!automations?.length) {
    return <EmptyState icon={Workflow} title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="type-panel-title">{t("rulesTitle")}</h2>
      {automations.map((automation) => (
        <div key={automation.id} className="border border-stroke rounded-2xl bg-surface overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <Toggle value={automation.active} onChange={(isActive) => update.mutate({ id: automation.id, dto: { active: isActive } })} />
            <button type="button" onClick={() => onEdit?.(automation)} className="flex-1 min-w-0 text-left cursor-pointer">
              <p className="type-form-label truncate">{automation.name}</p>
              <p className="type-hint text-ink-muted">{t(`triggers.${automation.trigger}`)}</p>
            </button>
            <Button variant="danger" size="icon" onClick={() => setDeleteTarget(automation.id)} aria-label={t("delete")}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}

      {deleteTarget && (
        <ConfirmDialog
          title={t("deleteConfirmTitle")}
          description={t("deleteConfirmMessage")}
          confirmLabel={t("delete")}
          variant="danger"
          onConfirm={() => {
            remove.mutate(deleteTarget);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
