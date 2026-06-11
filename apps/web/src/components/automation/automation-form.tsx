"use client";

import { useState, useEffect } from "react";
import { Plus, X, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { AutomationActionType, AutomationTrigger, PropertyType } from "@fixspace/domain";
import type { AutomationAction, AutomationResponseDto, CreateAutomationDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { FormField } from "@/components/ui/form/form-field";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { Select } from "@/components/ui/primitives/inputs/select";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { useAppContext } from "@/context/app-context";
import { useDatabaseContext } from "@/context/database-context";
import { useAutomationMutations } from "@/hooks/api/use-automation-mutations";
import { parseApiError } from "@/lib/api/client";

interface AutomationFormProps {
  databaseId: string;
  automation?: AutomationResponseDto;
  onSuccess?: () => void;
}

type TriggerType = AutomationTrigger;
type ActionType = AutomationActionType;

interface ActionDraft {
  type: ActionType;
  propertyId: string;
  value: string;
  databaseId: string;
}

interface TemplateDraft {
  name: string;
  trigger: TriggerType;
  config: Record<string, unknown>;
  actions: ActionDraft[];
}

interface TemplateItem {
  id: string;
  name: string;
  when: string;
  then: string;
  draft: TemplateDraft;
}

export function AutomationForm({ databaseId, automation, onSuccess }: AutomationFormProps) {
  const t = useTranslations("Automation");
  const { properties } = useDatabaseContext();
  const { databases } = useAppContext();

  const [step, setStep] = useState<"gallery" | "form">(automation ? "form" : "gallery");
  const [name, setName] = useState(automation?.name ?? "");
  const [trigger, setTrigger] = useState<TriggerType>(automation?.trigger ?? AutomationTrigger.ON_RECORD_CREATE);
  const [active, setActive] = useState(automation?.active ?? true);
  const [fieldChangePropertyId, setFieldChangePropertyId] = useState("");
  const [scheduleInterval, setScheduleInterval] = useState("daily");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDow, setScheduleDow] = useState("1");
  const [scheduleDom, setScheduleDom] = useState("1");
  const [actions, setActions] = useState<ActionDraft[]>([emptyAction()]);
  const [error, setError] = useState<string | null>(null);

  const { create, update } = useAutomationMutations(databaseId);

  useEffect(() => {
    if (!automation) return;
    setName(automation.name);
    setActive(automation.active);
    setTrigger(automation.trigger);
    const cfg = (automation.config ?? {}) as Record<string, unknown>;
    if (automation.trigger === AutomationTrigger.ON_FIELD_CHANGE) {
      setFieldChangePropertyId((cfg.propertyId as string) ?? "");
    }
    if (automation.trigger === AutomationTrigger.ON_SCHEDULE) {
      setScheduleInterval((cfg.interval as string) ?? "daily");
      setScheduleTime((cfg.time as string) ?? "09:00");
      setScheduleDow(String(cfg.dayOfWeek ?? 1));
      setScheduleDom(String(cfg.dayOfMonth ?? 1));
    }
    const rawActions = (automation.actions ?? []) as Array<Record<string, unknown>>;
    if (rawActions.length > 0) {
      setActions(
        rawActions.map((a) => ({
          type: (a.type as ActionType) ?? AutomationActionType.SET_FIELD_VALUE,
          propertyId: (a.propertyId as string) ?? "",
          value: (a.value as string) ?? "",
          databaseId: (a.databaseId as string) ?? "",
        })),
      );
    }
  }, [automation]);

  const uniqueProps = properties.filter(
    (property, index, allProperties) => allProperties.findIndex((item) => item.id === property.id) === index,
  );
  const triggerableProps = uniqueProps.filter((property) => property.type !== PropertyType.FORMULA);
  const writableProps = triggerableProps;
  const relationProps = uniqueProps.filter((property) => property.type === PropertyType.RELATION);
  const otherDatabases = databases.filter(
    (database, index, allDatabases) => database.id !== databaseId && allDatabases.findIndex((item) => item.id === database.id) === index,
  );

  const propertyOptions = [
    { value: "", label: t("propertyPlaceholder") },
    ...triggerableProps.map((p) => ({ value: p.id, label: p.name })),
  ];
  const writableOptions = [{ value: "", label: t("propertyPlaceholder") }, ...writableProps.map((p) => ({ value: p.id, label: p.name }))];
  const relationOptions = [{ value: "", label: t("propertyPlaceholder") }, ...relationProps.map((p) => ({ value: p.id, label: p.name }))];
  const dbOptions = [{ value: "", label: t("databasePlaceholder") }, ...otherDatabases.map((db) => ({ value: db.id, label: db.name }))];

  const templates: TemplateItem[] = [
    {
      id: "date-on-change",
      name: t("templates.dateOnChange.name"),
      when: t("templates.dateOnChange.when"),
      then: t("templates.dateOnChange.then"),
      draft: {
        name: t("templates.dateOnChange.name"),
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: { propertyId: "" },
        actions: [{ type: AutomationActionType.SET_FIELD_VALUE, propertyId: "", value: "", databaseId: "" }],
      },
    },
    {
      id: "fill-on-create",
      name: t("templates.fillOnCreate.name"),
      when: t("templates.fillOnCreate.when"),
      then: t("templates.fillOnCreate.then"),
      draft: {
        name: t("templates.fillOnCreate.name"),
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        config: {},
        actions: [{ type: AutomationActionType.SET_FIELD_VALUE, propertyId: "", value: "", databaseId: "" }],
      },
    },
    {
      id: "schedule-create",
      name: t("templates.scheduleCreate.name"),
      when: t("templates.scheduleCreate.when"),
      then: t("templates.scheduleCreate.then"),
      draft: {
        name: t("templates.scheduleCreate.name"),
        trigger: AutomationTrigger.ON_SCHEDULE,
        config: { interval: "weekly", time: "09:00", dayOfWeek: 1 },
        actions: [{ type: AutomationActionType.CREATE_RECORD, propertyId: "", value: "", databaseId: "" }],
      },
    },
    {
      id: "copy-to-db",
      name: t("templates.copyToDb.name"),
      when: t("templates.copyToDb.when"),
      then: t("templates.copyToDb.then"),
      draft: {
        name: t("templates.copyToDb.name"),
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: { propertyId: "" },
        actions: [{ type: AutomationActionType.CREATE_RECORD, propertyId: "", value: "", databaseId: "" }],
      },
    },
    {
      id: "auto-log-mistake",
      name: t("templates.autoLogMistake.name"),
      when: t("templates.autoLogMistake.when"),
      then: t("templates.autoLogMistake.then"),
      draft: {
        name: t("templates.autoLogMistake.name"),
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: { propertyId: "", condition: { type: "equals", value: true } },
        actions: [{ type: AutomationActionType.CREATE_RECORD, propertyId: "", value: "", databaseId: "" }],
      },
    },
    {
      id: "weekly-review",
      name: t("templates.weeklyReview.name"),
      when: t("templates.weeklyReview.when"),
      then: t("templates.weeklyReview.then"),
      draft: {
        name: t("templates.weeklyReview.name"),
        trigger: AutomationTrigger.ON_SCHEDULE,
        config: { interval: "weekly", time: "09:00", dayOfWeek: 1 },
        actions: [{ type: AutomationActionType.CREATE_RECORD, propertyId: "", value: "", databaseId: "" }],
      },
    },
    {
      id: "auto-categorize",
      name: t("templates.autoCategorize.name"),
      when: t("templates.autoCategorize.when"),
      then: t("templates.autoCategorize.then"),
      draft: {
        name: t("templates.autoCategorize.name"),
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: { propertyId: "" },
        actions: [{ type: AutomationActionType.SET_FIELD_VALUE, propertyId: "", value: "", databaseId: "" }],
      },
    },
    {
      id: "risk-limit",
      name: t("templates.riskLimit.name"),
      when: t("templates.riskLimit.when"),
      then: t("templates.riskLimit.then"),
      draft: {
        name: t("templates.riskLimit.name"),
        trigger: AutomationTrigger.ON_FIELD_CHANGE,
        config: { propertyId: "" },
        actions: [{ type: AutomationActionType.SET_FIELD_VALUE, propertyId: "", value: "true", databaseId: "" }],
      },
    },
    {
      id: "link-trades-to-review",
      name: t("templates.linkTradesToReview.name"),
      when: t("templates.linkTradesToReview.when"),
      then: t("templates.linkTradesToReview.then"),
      draft: {
        name: t("templates.linkTradesToReview.name"),
        trigger: AutomationTrigger.ON_RECORD_CREATE,
        config: {},
        actions: [{ type: AutomationActionType.LINK_RECORDS, propertyId: "", value: "", databaseId: "" }],
      },
    },
  ];

  const TRIGGER_LABELS: Record<TriggerType, string> = {
    [AutomationTrigger.ON_RECORD_CREATE]: t("triggers.ON_RECORD_CREATE"),
    [AutomationTrigger.ON_FIELD_CHANGE]: t("triggers.ON_FIELD_CHANGE"),
    [AutomationTrigger.ON_SCHEDULE]: t("triggers.ON_SCHEDULE"),
  };

  const ACTION_LABELS: Record<ActionType, string> = {
    [AutomationActionType.SET_FIELD_VALUE]: t("actions.SET_FIELD_VALUE"),
    [AutomationActionType.CREATE_RECORD]: t("actions.CREATE_RECORD"),
    [AutomationActionType.LINK_RECORDS]: t("actions.LINK_RECORDS"),
  };

  const INTERVAL_OPTIONS = [
    { value: "daily", label: t("scheduleIntervals.daily") },
    { value: "weekly", label: t("scheduleIntervals.weekly") },
    { value: "monthly", label: t("scheduleIntervals.monthly") },
  ];

  const DOW_OPTIONS = [
    { value: "1", label: t("daysOfWeek.1") },
    { value: "2", label: t("daysOfWeek.2") },
    { value: "3", label: t("daysOfWeek.3") },
    { value: "4", label: t("daysOfWeek.4") },
    { value: "5", label: t("daysOfWeek.5") },
    { value: "6", label: t("daysOfWeek.6") },
    { value: "0", label: t("daysOfWeek.0") },
  ];

  function emptyAction(): ActionDraft {
    return {
      type: AutomationActionType.SET_FIELD_VALUE,
      propertyId: "",
      value: "",
      databaseId: "",
    };
  }

  function applyTemplate(template: TemplateItem) {
    setName(template.draft.name);
    setTrigger(template.draft.trigger);
    setActions(template.draft.actions.map((action) => ({ ...action })));
    const templateConfig = template.draft.config as Record<string, string | number>;
    if (template.draft.trigger === AutomationTrigger.ON_FIELD_CHANGE) {
      setFieldChangePropertyId((templateConfig.propertyId as string) ?? "");
    }
    if (template.draft.trigger === AutomationTrigger.ON_SCHEDULE) {
      setScheduleInterval((templateConfig.interval as string) ?? "daily");
      setScheduleTime((templateConfig.time as string) ?? "09:00");
      setScheduleDow(String(templateConfig.dayOfWeek ?? 1));
      setScheduleDom(String(templateConfig.dayOfMonth ?? 1));
    }
    setStep("form");
  }

  function buildConfig(): Record<string, unknown> | undefined {
    if (trigger === AutomationTrigger.ON_FIELD_CHANGE) {
      return { propertyId: fieldChangePropertyId };
    }
    if (trigger === AutomationTrigger.ON_SCHEDULE) {
      const scheduleConfig: Record<string, unknown> = { interval: scheduleInterval, time: scheduleTime };
      if (scheduleInterval === "weekly") scheduleConfig.dayOfWeek = parseInt(scheduleDow);
      if (scheduleInterval === "monthly") scheduleConfig.dayOfMonth = parseInt(scheduleDom);
      return scheduleConfig;
    }
    return undefined;
  }

  function buildActions() {
    return actions.map((action) => {
      if (action.type === AutomationActionType.SET_FIELD_VALUE) {
        return { type: action.type, propertyId: action.propertyId, valueType: "FIXED", value: action.value };
      }
      if (action.type === AutomationActionType.CREATE_RECORD) {
        return { type: action.type, databaseId: action.databaseId || databaseId, fieldMappings: [] };
      }
      return { type: action.type, propertyId: action.propertyId, sourceDatabaseId: action.databaseId, filters: [], writeMode: "REPLACE" };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim() || "Untitled",
      trigger,
      active,
      config: buildConfig(),
      actions: buildActions() as AutomationAction[],
    };

    if (automation) {
      update.mutate(
        { id: automation.id, dto: payload },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (err) => setError(parseApiError(err)),
        },
      );
    } else {
      create.mutate({ ...payload, databaseId } as CreateAutomationDto, {
        onSuccess: () => {
          setStep("gallery");
          setName("");
          setTrigger(AutomationTrigger.ON_RECORD_CREATE);
          setActions([emptyAction()]);
          setActive(true);
          onSuccess?.();
        },
        onError: (err) => setError(parseApiError(err)),
      });
    }
  }

  function updateAction(index: number, patch: Partial<ActionDraft>) {
    setActions((prev) => prev.map((action, actionIndex) => (actionIndex === index ? { ...action, ...patch } : action)));
  }

  if (step === "gallery") {
    return (
      <div className="flex flex-col gap-4">
        <p className="type-hint">{t("selectTemplateHint")}</p>

        <div className="flex flex-col gap-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-left p-3 border border-stroke rounded-xl bg-surface hover:bg-canvas transition-colors"
            >
              <p className="type-form-label">{tpl.name}</p>
              <p className="type-hint mt-0.5">
                <span className="text-ink-secondary">{t("whenSection")}</span> {tpl.when} →{" "}
                <span className="text-ink-secondary">{t("thenSection")}</span> {tpl.then}
              </p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setName("");
            setStep("form");
          }}
          className="text-left p-3 border border-stroke border-dashed rounded-xl bg-surface hover:bg-canvas transition-colors flex items-center gap-2"
        >
          <Zap size={14} className="text-ink-secondary" />
          <span className="type-form-label">{t("startFromScratch")}</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="type-form-label text-ink-secondary">{t("state")}</span>
        <div className="flex items-center gap-2">
          <span className="type-hint">{active ? t("active") : t("inactive")}</span>
          <Toggle value={active} onChange={setActive} />
        </div>
      </div>

      <FormField
        id="automation-name"
        label={t("name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
      />

      <div className="flex flex-col gap-2 p-3 border border-stroke rounded-xl bg-canvas">
        <p className="type-form-label text-accent">{t("whenSection")}</p>

        <Select
          value={trigger}
          onChange={(e) => setTrigger(e.target.value as TriggerType)}
          options={Object.values(AutomationTrigger).map((triggerValue) => ({ value: triggerValue, label: TRIGGER_LABELS[triggerValue] }))}
        />

        {trigger === AutomationTrigger.ON_FIELD_CHANGE && (
          <Select value={fieldChangePropertyId} onChange={(e) => setFieldChangePropertyId(e.target.value)} options={propertyOptions} />
        )}

        {trigger === AutomationTrigger.ON_SCHEDULE && (
          <div className="flex flex-col gap-2">
            <Select value={scheduleInterval} onChange={(e) => setScheduleInterval(e.target.value)} options={INTERVAL_OPTIONS} />
            <div className="flex gap-2">
              <TextInput value={scheduleTime} onChange={setScheduleTime} placeholder="09:00" type="time" size="sm" />
              {scheduleInterval === "weekly" && (
                <Select value={scheduleDow} onChange={(e) => setScheduleDow(e.target.value)} options={DOW_OPTIONS} className="flex-1" />
              )}
              {scheduleInterval === "monthly" && (
                <TextInput value={scheduleDom} onChange={setScheduleDom} placeholder="1" type="number" size="sm" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3 border border-stroke rounded-xl bg-canvas">
        <p className="type-form-label text-accent">{t("thenSection")}</p>

        {actions.map((action, index) => (
          <div key={index} className="flex flex-col gap-2 p-2 border border-stroke rounded-lg bg-surface">
            <div className="flex items-center gap-2">
              <Select
                value={action.type}
                onChange={(e) => updateAction(index, { type: e.target.value as ActionType, propertyId: "", databaseId: "" })}
                options={Object.values(AutomationActionType).map((actionValue) => ({
                  value: actionValue,
                  label: ACTION_LABELS[actionValue],
                }))}
                className="flex-1"
              />
              {actions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActions((prev) => prev.filter((_, actionIndex) => actionIndex !== index))}
                  className="text-ink-secondary hover:text-error shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {action.type === AutomationActionType.SET_FIELD_VALUE && (
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={action.propertyId}
                  onChange={(e) => updateAction(index, { propertyId: e.target.value })}
                  options={writableOptions}
                />
                <TextInput
                  value={action.value}
                  onChange={(newValue) => updateAction(index, { value: newValue })}
                  placeholder={t("thenSection")}
                  size="sm"
                />
              </div>
            )}

            {action.type === AutomationActionType.CREATE_RECORD && (
              <Select value={action.databaseId} onChange={(e) => updateAction(index, { databaseId: e.target.value })} options={dbOptions} />
            )}

            {action.type === AutomationActionType.LINK_RECORDS && (
              <div className="flex flex-col gap-2">
                <Select
                  value={action.propertyId}
                  onChange={(e) => updateAction(index, { propertyId: e.target.value })}
                  options={relationOptions.length > 1 ? relationOptions : [{ value: "", label: t("noRelationFields") }]}
                />
                <Select
                  value={action.databaseId}
                  onChange={(e) => updateAction(index, { databaseId: e.target.value })}
                  options={dbOptions}
                />
              </div>
            )}
          </div>
        ))}

        {actions.length < 5 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setActions((prev) => [...prev, emptyAction()])}
            leftIcon={<Plus size={14} />}
          >
            {t("addAction")}
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!automation) setStep("gallery");
          }}
        >
          {automation ? t("save") : t("back")}
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={create.isPending || update.isPending}>
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
