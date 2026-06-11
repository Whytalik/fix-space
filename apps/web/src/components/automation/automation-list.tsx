"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2, Pencil, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import { AutomationTrigger } from "@fixspace/domain";
import type { AutomationResponseDto } from "@fixspace/domain";
import { useAutomationsQuery, useAutomationLogsQuery } from "@/hooks/api/use-automations-query";
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

interface AutomationAction {
  type: string;
}

interface ScheduleConfig {
  interval?: string;
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

function AutomationLogs({ automationId }: { automationId: string }) {
  const t = useTranslations("Automation");
  const { data: logs, isLoading } = useAutomationLogsQuery(automationId, true);

  if (isLoading) return <Spinner size="sm" />;
  if (!logs?.length) return <p className="type-hint text-ink-muted">{t("noLogs")}</p>;

  return (
    <div className="flex flex-col gap-1 mt-1">
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2 py-1 border-t border-stroke">
          <span
            className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
              log.status === "SUCCESS"
                ? "bg-success/10 text-success"
                : log.status === "FAILURE"
                  ? "bg-error/10 text-error"
                  : "bg-stroke text-ink-secondary"
            }`}
          >
            {log.status}
          </span>
          <span className="type-hint flex-1">{log.result ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

export function AutomationList({ databaseId, onEdit }: AutomationListProps) {
  const t = useTranslations("Automation");
  const { data: automations, isLoading } = useAutomationsQuery(databaseId);
  const { update, remove } = useAutomationMutations(databaseId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const dayLabels: Record<number, string> = {
    0: t("daysOfWeek.0"),
    1: t("daysOfWeek.1"),
    2: t("daysOfWeek.2"),
    3: t("daysOfWeek.3"),
    4: t("daysOfWeek.4"),
    5: t("daysOfWeek.5"),
    6: t("daysOfWeek.6"),
  };

  function formatScheduleSummary(config: ScheduleConfig): string {
    const parts: string[] = [];
    if (config.interval === "daily") parts.push(t("scheduleIntervals.daily"));
    else if (config.interval === "weekly") {
      const day = config.dayOfWeek !== undefined ? (dayLabels[config.dayOfWeek] ?? "") : "";
      parts.push(t("scheduleSummary.weekly", { day }));
    } else if (config.interval === "monthly") {
      parts.push(t("scheduleSummary.monthly", { day: config.dayOfMonth ?? 1 }));
    }
    if (config.time) parts.push(t("scheduleSummary.at", { time: config.time }));
    return parts.join(" ") || t("triggers.ON_SCHEDULE");
  }

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
      {automations.map((automation) => {
        const isExpanded = expandedIds.has(automation.id);
        const actions = (automation.actions as AutomationAction[] | null) ?? [];
        const config = (automation.config ?? {}) as Record<string, unknown>;

        return (
          <div key={automation.id} className="border border-stroke rounded-xl bg-surface overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <Toggle value={automation.active} onChange={(isActive) => update.mutate({ id: automation.id, dto: { active: isActive } })} />
              <div className="flex-1 min-w-0">
                <p className="type-form-label truncate">{automation.name}</p>
                <p className="type-hint text-ink-muted">{t(`triggers.${automation.trigger}`)}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleExpanded(automation.id)}
                className="text-ink-muted hover:text-ink shrink-0 transition-colors duration-150"
                aria-label={t("details")}
              >
                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(automation)}
                  className="text-ink-muted hover:text-ink shrink-0 transition-colors duration-150"
                  aria-label={t("edit")}
                >
                  <Pencil size={14} />
                </button>
              )}
              <Button variant="danger" size="icon" onClick={() => setDeleteTarget(automation.id)} aria-label={t("delete")}>
                <Trash2 size={14} />
              </Button>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-stroke flex flex-col gap-4">
                {automation.trigger === AutomationTrigger.ON_SCHEDULE && (
                  <div>
                    <p className="type-hint font-medium text-ink-secondary mb-1">{t("scheduleLabel")}</p>
                    <p className="type-hint">{formatScheduleSummary(config as ScheduleConfig)}</p>
                  </div>
                )}

                {actions.length > 0 && (
                  <div>
                    <p className="type-hint font-medium text-ink-secondary mb-1">
                      {t("actionsLabel")} ({actions.length})
                    </p>
                    <ul className="flex flex-col gap-1">
                      {actions.map((action, index) => (
                        <li key={index} className="type-hint flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-ink-muted shrink-0" />
                          {t(`actions.${action.type}`)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="type-hint font-medium text-ink-secondary mb-1">{t("lastRunsLabel")}</p>
                  <AutomationLogs automationId={automation.id} />
                </div>
              </div>
            )}
          </div>
        );
      })}

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
