"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { PropertyIcon } from "@/app/[locale]/(dashboard)/database/[id]/_components/properties/ui/property-icon";
import { useTranslations } from "next-intl";
import { AutomationActionType, AutomationTrigger, PropertyType } from "@fixspace/domain";
import type { AutomationAction, AutomationResponseDto, CreateAutomationDto, PropertyResponseDto } from "@fixspace/domain";
import type { ComboboxOption } from "@/components/ui/primitives/inputs/combobox";
import { Button } from "@/components/ui/primitives/actions/button";
import { FormField } from "@/components/ui/form/form-field";
import { TextInput } from "@/components/ui/primitives/inputs/text-input";
import { NumberInput } from "@/components/ui/primitives/inputs/number-input";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { useAppContext } from "@/context/app-context";
import { useDatabaseContext } from "@/context/database-context";
import { useAutomationMutations } from "@/hooks/api/use-automation-mutations";
import { parseApiError } from "@/lib/api/client";

import { ActionRow } from "./components/action-row";
import { AutomationGallery } from "./components/automation-gallery";

interface AutomationFormProps {
  databaseId: string;
  automation?: AutomationResponseDto;
  initialMode?: "view" | "edit";
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

export function AutomationForm({ databaseId, automation, initialMode, onSuccess }: AutomationFormProps) {
  const t = useTranslations("Automation");
  const { properties } = useDatabaseContext();
  const { databases } = useAppContext();

  const [formMode, setFormMode] = useState<"view" | "edit">(initialMode ?? (automation ? "view" : "edit"));
  const isViewMode = formMode === "view";

  const [step, setStep] = useState<"gallery" | "form">(automation ? "form" : "gallery");
  const [name, setName] = useState(automation?.name ?? "");
  const [trigger, setTrigger] = useState<TriggerType>(automation?.trigger ?? AutomationTrigger.ON_RECORD_CREATE);
  const [active, setActive] = useState(automation?.active ?? true);
  const [fieldChangePropertyId, setFieldChangePropertyId] = useState("");
  const [scheduleInterval, setScheduleInterval] = useState("daily");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDow, setScheduleDow] = useState("1");
  const [scheduleDom, setScheduleDom] = useState<number | null>(1);
  const [actions, setActions] = useState<ActionDraft[]>([emptyAction()]);
  const [error, setError] = useState<string | null>(null);

  const { create, update } = useAutomationMutations(databaseId);

  useEffect(() => {
    if (!automation) return;
    setName(automation.name);
    setActive(automation.active);
    setTrigger(automation.trigger);
    const automationConfig = (automation.config ?? {}) as Record<string, unknown>;
    if (automation.trigger === AutomationTrigger.ON_FIELD_CHANGE) {
      setFieldChangePropertyId((automationConfig.propertyId as string) ?? "");
    }
    if (automation.trigger === AutomationTrigger.ON_SCHEDULE) {
      setScheduleInterval((automationConfig.interval as string) ?? "daily");
      setScheduleTime((automationConfig.time as string) ?? "09:00");
      setScheduleDow(String(automationConfig.dayOfWeek ?? 1));
      setScheduleDom(Number(automationConfig.dayOfMonth ?? 1));
    }
    const rawActions = (automation.actions ?? []) as Array<Record<string, unknown>>;
    if (rawActions.length > 0) {
      setActions(
        rawActions.map((a) => {
          const valueType = a.valueType as string | undefined;
          const rawValue = a.value as string | undefined;
          let value = rawValue ?? "";
          if (valueType === "TODAY") value = "$today";
          return {
            type: (a.type as ActionType) ?? AutomationActionType.SET_FIELD_VALUE,
            propertyId: (a.propertyId as string) ?? "",
            value,
            databaseId: (a.databaseId as string) ?? "",
          };
        }),
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

  function toOption(property: PropertyResponseDto): ComboboxOption {
    return { value: property.id, label: property.name, iconElement: <PropertyIcon type={property.type} size={14} /> };
  }

  const writableOptions = [{ value: "", label: t("propertyPlaceholder") }, ...writableProps.map(toOption)];

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
      setScheduleDom(Number(templateConfig.dayOfMonth ?? 1));
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
      if (scheduleInterval === "monthly") scheduleConfig.dayOfMonth = scheduleDom ?? 1;
      return scheduleConfig;
    }
    return undefined;
  }

  function buildActions() {
    return actions.map((action) => {
      if (action.type === AutomationActionType.SET_FIELD_VALUE) {
        if (action.value === "$today") {
          return { type: action.type, propertyId: action.propertyId, valueType: "TODAY" };
        }
        return { type: action.type, propertyId: action.propertyId, valueType: "FIXED", value: action.value };
      }
      if (action.type === AutomationActionType.CREATE_RECORD) {
        return { type: action.type, databaseId: action.databaseId || databaseId, fieldMappings: [] };
      }
      return { type: action.type, propertyId: action.propertyId, sourceDatabaseId: action.databaseId, filters: [], writeMode: "REPLACE" };
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      <AutomationGallery
        templates={templates}
        onApplyTemplate={applyTemplate}
        onStartFromScratch={() => {
          setName("");
          setStep("form");
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className={`flex flex-col gap-4${isViewMode ? " pointer-events-none opacity-60" : ""}`}>
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
          onChange={(event) => setName(event.target.value)}
          placeholder={t("namePlaceholder")}
        />

        <div className="flex flex-col gap-2 p-3 border border-stroke rounded-2xl bg-canvas">
          <p className="type-form-label text-accent">{t("whenSection")}</p>

          <Combobox
            value={trigger}
            onChange={(value) => setTrigger(value as TriggerType)}
            options={Object.values(AutomationTrigger).map((value) => ({ value, label: TRIGGER_LABELS[value] }))}
          />

          {trigger === AutomationTrigger.ON_FIELD_CHANGE && (
            <Combobox
              value={fieldChangePropertyId}
              onChange={setFieldChangePropertyId}
              options={triggerableProps.map(toOption)}
              placeholder={t("propertyPlaceholder")}
              nullable
            />
          )}

          {trigger === AutomationTrigger.ON_SCHEDULE && (
            <div className="flex flex-col gap-2">
              <Combobox value={scheduleInterval} onChange={setScheduleInterval} options={INTERVAL_OPTIONS} />
              <div className="flex gap-2">
                <TextInput value={scheduleTime} onChange={setScheduleTime} placeholder="09:00" type="time" />
                {scheduleInterval === "weekly" && (
                  <div className="flex-1">
                    <Combobox value={scheduleDow} onChange={setScheduleDow} options={DOW_OPTIONS} />
                  </div>
                )}
                {scheduleInterval === "monthly" && (
                  <NumberInput value={scheduleDom} onChange={setScheduleDom} placeholder="1" min={1} max={31} />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3 border border-stroke rounded-2xl bg-canvas">
          <p className="type-form-label text-accent">{t("thenSection")}</p>

          {actions.map((action, index) => (
            <ActionRow
              key={index}
              action={action}
              index={index}
              onUpdateAction={updateAction}
              onDeleteAction={(actionIndex) => setActions((prev) => prev.filter((_, idx) => idx !== actionIndex))}
              isDeleteDisabled={actions.length <= 1}
              actionLabels={ACTION_LABELS}
              writableOptions={writableOptions}
              writableProps={writableProps}
              relationProps={relationProps}
              otherDatabases={otherDatabases}
            />
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
      </div>

      {isViewMode ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={() => setFormMode("edit")}>
            {t("edit")}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (automation) setFormMode("view");
              else setStep("gallery");
            }}
          >
            {t("back")}
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={create.isPending || update.isPending}>
            {t("save")}
          </Button>
        </div>
      )}
    </form>
  );
}
