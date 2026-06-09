import { Card } from "@/components/ui/primitives/display/card";
import { Link, useRouter } from "@/i18n/navigation";
import type { WorkflowStep } from "@fixspace/domain";
import { Check, Plus, Lock, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTemplatesQuery } from "@/hooks/api/use-templates-query";
import { createRecord } from "@/lib/api/record";
import { useUIContext } from "@/context/ui-context";
import { TemplatePickerModal } from "@/app/[locale]/(dashboard)/database/[id]/_components/template-picker-modal";
import { useTranslations } from "next-intl";

interface DailyWorkflowProps {
  steps: WorkflowStep[];
  spaceId: string;
}

export function DailyWorkflow({ steps, spaceId }: DailyWorkflowProps) {
  const t = useTranslations("Dashboard");
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.min((completedCount / (steps.length - 1)) * 100, 100);

  return (
    <Card className="w-full relative overflow-hidden">
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="type-panel-title">{t("dailyWorkflowTitle")}</h2>
          <span className="text-sm font-medium text-ink-secondary">
            {t("completedSteps", { completed: completedCount, total: steps.length })}
          </span>
        </div>

        <div className="relative flex justify-between items-start">
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-border -z-10" />
          <div
            className="absolute top-5 left-[12.5%] h-0.5 bg-accent -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercent * 0.75}%` }}
          />

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
                stepDisplayName={t(translationKey as any)}
                idx={idx}
                isUnlocked={isUnlocked}
                totalSteps={steps.length}
                spaceId={spaceId}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function WorkflowStepNode({
  step,
  stepDisplayName,
  idx,
  isUnlocked,
  totalSteps,
  spaceId,
}: {
  step: WorkflowStep;
  stepDisplayName: string;
  idx: number;
  isUnlocked: boolean;
  totalSteps: number;
  spaceId: string;
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

  function handleNodeClick(e: React.MouseEvent) {
    if (!isUnlocked || !step.databaseId) {
      e.preventDefault();
      return;
    }

    if (step.isCompleted) {
      return;
    }

    e.preventDefault();
    setShowPicker(true);
  }

  return (
    <>
      <div
        onClick={(e) => {
          if (step.databaseId && isUnlocked && step.isCompleted) {
            router.push(`/database/${step.databaseId}`);
          } else {
            handleNodeClick(e as any);
          }
        }}
        className={`flex flex-col items-center group flex-1 relative ${step.databaseId && isUnlocked ? "cursor-pointer" : "cursor-default"}`}
      >
        {idx < totalSteps - 1 && (
          <div
            className={`absolute top-[10px] -right-3 sm:-right-4 w-5 h-5 flex items-center justify-center bg-canvas rounded-full border z-0 transition-colors
            ${step.isCompleted ? "border-accent text-accent" : "border-border text-border"}`}
          >
            <ChevronRight size={12} strokeWidth={3} />
          </div>
        )}

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10
          ${
            step.isCompleted
              ? "bg-success text-white shadow-[0_0_12px_rgba(var(--color-success),0.4)]"
              : isUnlocked
                ? "bg-surface border-2 border-accent text-accent shadow-[0_0_8px_rgba(var(--color-accent),0.3)] group-hover:bg-accent group-hover:text-white"
                : "bg-surface border-2 border-border text-ink-muted/50"
          }`}
        >
          {isCreating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : step.isCompleted ? (
            <Check size={18} strokeWidth={3} />
          ) : isUnlocked ? (
            <Plus size={18} />
          ) : (
            <Lock size={16} />
          )}
        </div>

        <span
          className={`text-sm mt-3 font-medium text-center px-1 transition-colors
          ${step.isCompleted ? "text-ink" : isUnlocked ? "text-ink group-hover:text-accent" : "text-ink-secondary/50"}`}
        >
          {stepDisplayName}
        </span>

        <div className="mt-2 flex flex-col items-center gap-1">
          {step.isCompleted && (
            <span className="text-xs text-ink-secondary">
              {step.recordCount} {t("recordsCount", { count: step.recordCount })}
            </span>
          )}
          {step.databaseId && !step.isCompleted && (
            <button
              type="button"
              disabled={!isUnlocked}
              onClick={(e) => {
                if (isUnlocked) {
                  e.stopPropagation();
                  setShowPicker(true);
                }
              }}
              className={`text-xs font-medium px-3 py-1 rounded-lg border transition-colors duration-150
                ${
                  isUnlocked
                    ? "border-accent text-accent hover:bg-accent hover:text-white"
                    : "border-border text-ink-secondary/40 cursor-not-allowed"
                }`}
            >
              {t("newRecord")}
            </button>
          )}
          {!step.databaseId && <span className="text-xs text-ink-muted/40">{t("noDatabase")}</span>}
        </div>
      </div>

      {showPicker && <TemplatePickerModal templates={templates} onSelect={handleCreate} onClose={() => setShowPicker(false)} />}
    </>
  );
}
