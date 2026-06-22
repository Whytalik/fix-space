import { Card } from "@/components/ui/primitives/display/card";
import { useRouter } from "@/i18n/navigation";
import type { WorkflowStep } from "@fixspace/domain";
import { Check, Plus, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTemplatesQuery } from "@/hooks/api/use-templates-query";
import { createRecord } from "@/lib/api/record";
import { useUIContext } from "@/context/ui-context";
import { TemplatePickerModal } from "@/app/[locale]/(dashboard)/database/[id]/_components/template-picker-modal";
import { useTranslations } from "next-intl";

interface DailyWorkflowProps {
  steps: WorkflowStep[];
}

export function DailyWorkflow({ steps }: DailyWorkflowProps) {
  const t = useTranslations("Dashboard");
  const completedCount = steps.filter((s) => s.isCompleted).length;

  return (
    <Card className="w-full relative overflow-hidden">
      <div className="flex flex-col gap-5 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink tracking-tight">{t("dailyWorkflowTitle")}</h2>
          <span className="text-[11px] font-mono uppercase tracking-widest text-ink-secondary bg-canvas/50 px-3 py-1.5 rounded-lg border border-stroke/50">
            {t("completedSteps", { completed: completedCount, total: steps.length })}
          </span>
        </div>

        <div className="relative">
          <div className="flex justify-between items-start gap-2">
            {steps.map((step, idx) => {
              const isUnlocked = idx === 0 || (steps[idx - 1]?.isCompleted ?? false);

              const stepKeyMap: Record<string, string> = {
                "Plan Routine": "planRoutine",
                "Execute Trade": "executeTrade",
                "Reflect & Notes": "reflectNotes",
                "Reflect Notes": "reflectNotes",
                "Log Mistakes": "logMistakes",
              };
              const translationKey = stepKeyMap[step.name] || step.name;

              return (
                <WorkflowStepNode
                  key={step.name}
                  step={step}
                  stepDisplayName={t(translationKey as Parameters<typeof t>[0])}
                  isUnlocked={isUnlocked}
                  isLast={idx === steps.length - 1}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function WorkflowStepNode({
  step,
  stepDisplayName,
  isUnlocked,
  isLast,
}: {
  step: WorkflowStep;
  stepDisplayName: string;
  isUnlocked: boolean;
  isLast: boolean;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const { showError } = useUIContext();
  const [showPicker, setShowPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: templates = [] } = useTemplatesQuery(step.databaseId || "", { enabled: showPicker });

  async function handleCreate(templateId: string | null) {
    if (!step.databaseId) return;
    setShowPicker(false);
    try {
      setIsCreating(true);
      const created = await createRecord(step.databaseId, { templateId });
      router.push(`/record/${created.id}`);
    } catch (error) {
      showError(error);
      setIsCreating(false);
    }
  }

  const status: "completed" | "active" | "locked" = step.isCompleted ? "completed" : isUnlocked ? "active" : "locked";

  return (
    <>
      <div className="relative flex flex-col items-center flex-1 min-w-0">
        {!isLast && (
          <>
            <div className="absolute top-5 left-1/2 w-[calc(100%+8px)] h-1 bg-stroke -z-10" />
            <div
              className={`absolute top-5 left-1/2 w-[calc(100%+8px)] h-1 -z-10 transition-colors duration-500 ease-in-out ${step.isCompleted ? "bg-accent" : "bg-transparent"}`}
            />
          </>
        )}

        <div
          onClick={() => {
            if (status === "completed" && step.databaseId) {
              router.push(`/database/${step.databaseId}`);
            } else if (status === "active") {
              setShowPicker(true);
            }
          }}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 z-10
            ${
              status === "completed"
                ? "bg-success cursor-pointer"
                : status === "active"
                  ? "bg-surface border-2 border-accent text-accent cursor-pointer"
                  : "bg-surface border-2 border-stroke cursor-default"
            }`}
        >
          {isCreating ? (
            <Loader2 size={18} className="animate-spin text-accent" />
          ) : status === "completed" ? (
            <Check size={18} strokeWidth={3} className="text-white" />
          ) : status === "active" ? (
            <Plus size={18} strokeWidth={2.5} />
          ) : (
            <Lock size={16} className="text-ink-muted/50" />
          )}
        </div>

        <div
          className={`w-full mt-4 rounded-lg border p-2 text-center transition-colors duration-150
            ${
              status === "completed"
                ? "border-success/30 bg-success-bg/50"
                : status === "active"
                  ? "border-accent/25 bg-accent/5"
                  : "border-stroke"
            }`}
        >
          <span
            className={`text-xs font-semibold block truncate
              ${status === "completed" ? "text-ink" : status === "active" ? "text-ink" : "text-ink-muted"}`}
          >
            {stepDisplayName}
          </span>

          <div className="mt-1.5 flex flex-col items-center gap-1">
            {status === "completed" && (
              <span className="text-[10px] text-ink-secondary tabular-nums">
                {step.recordCount} {t("recordsCount", { count: step.recordCount })}
              </span>
            )}

            {status === "active" && step.databaseId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPicker(true);
                }}
                className="text-[10px] font-medium px-2 py-0.5 rounded border border-accent text-accent transition-colors duration-150"
              >
                {t("newRecord")}
              </button>
            )}

            {status === "locked" && <span className="text-[10px] text-ink-muted/40">{t("noDatabase")}</span>}
          </div>
        </div>
      </div>

      {showPicker && <TemplatePickerModal templates={templates} onSelect={handleCreate} onClose={() => setShowPicker(false)} />}
    </>
  );
}
