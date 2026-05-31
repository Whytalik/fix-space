"use client";

import { TabSwitcher, type TabItem } from "@/components/ui/primitives/navigation/tab-switcher";
import { useAppContext } from "@/context/app-context";
import { useDatabaseContext } from "@/context/database-context";
import { useUIContext } from "@/context/ui-context";
import { updateDatabase } from "@/lib/api/database";
import { deleteProperty, updateProperty } from "@/lib/api/property";
import type { PropertyResponseDto } from "@fixspace/domain";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EditGeneralSection } from "./_components/edit-general-section";
import { EditPropertiesSection } from "./_components/edit-properties-section";
import { EditTemplatesSection } from "./_components/edit-templates-section";
import { PropertyFormModal } from "./_components/property-form-modal";
import { useTranslations } from "next-intl";

type EditTab = "general" | "properties" | "templates";

const EDIT_TABS: TabItem<EditTab>[] = [
  { id: "general", label: "general" },
  { id: "properties", label: "properties" },
  { id: "templates", label: "templates" },
];

const DB_PREFIX = "[DB] ";

export default function EditDatabasePage() {
  const searchParams = useSearchParams();
  const { database, properties, applyDatabaseUpdate, applyPropertiesUpdate, wrapCells, setWrapCells } =
    useDatabaseContext();
  const { updateDatabaseInSpace, databases: allDatabases } = useAppContext();
  const { showError } = useUIContext();
  const t = useTranslations("DatabaseEdit");

  const [activeTab, setActiveTab] = useState<EditTab>(() => {
    const tab = searchParams.get("tab");
    return tab === "properties" || tab === "templates" ? tab : "general";
  });
  const [icon, setIcon] = useState(() => database?.icon ?? "");
  const [title, setTitle] = useState(() => database?.title ?? "");
  const [recordLimit, setRecordLimit] = useState<number | null>(() => database?.recordLimit ?? null);
  const [useDefaultTemplate, setUseDefaultTemplate] = useState(() => database?.useDefaultTemplate ?? true);
  const [propertyModal, setPropertyModal] = useState<
    { mode: "create" } | { mode: "edit"; property: PropertyResponseDto } | null
  >(null);

  useEffect(() => {
    if (!database) return;
    setIcon(database.icon ?? "");
    setTitle(database.title ?? "");
    setRecordLimit(database.recordLimit ?? null);
    setUseDefaultTemplate(database.useDefaultTemplate ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database?.id]);

  async function saveDatabase(
    patch: Partial<{ icon: string; title: string; recordLimit: number | null; useDefaultTemplate: boolean }>,
  ) {
    if (!database) return;
    try {
      const updated = await updateDatabase(database.spaceId, database.id, {
        icon: (patch.icon !== undefined ? patch.icon : icon) || undefined,
        title: patch.title !== undefined ? patch.title : title,
        name: `${DB_PREFIX}${patch.title !== undefined ? patch.title : title}`,
        recordLimit: patch.recordLimit !== undefined ? patch.recordLimit : recordLimit,
        useDefaultTemplate: patch.useDefaultTemplate !== undefined ? patch.useDefaultTemplate : useDefaultTemplate,
      });
      applyDatabaseUpdate(updated);
      updateDatabaseInSpace(updated);
    } catch (e) {
      showError(e);
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleTitleBlur() {
    saveDatabase({ title });
  }

  function handleIconChange(val: string) {
    setIcon(val);
    saveDatabase({ icon: val });
  }

  function handleRecordLimitChange(val: number | null) {
    setRecordLimit(val);
    saveDatabase({ recordLimit: val });
  }

  function handleUseDefaultTemplateChange(val: boolean) {
    setUseDefaultTemplate(val);
    saveDatabase({ useDefaultTemplate: val });
  }

  function handlePropertyUpdate(
    id: string,
    data: Partial<{ position: number; group: string | null; isVisible: boolean }>,
  ) {
    applyPropertiesUpdate(properties.map((p) => (p.id === id ? { ...p, ...data } : p)));
    updateProperty(id, data).catch(showError);
  }

  const existingGroups = useMemo(
    () => [...new Set(properties.map((p) => p.group).filter(Boolean) as string[])],
    [properties],
  );

  function handleAddProperty() {
    setPropertyModal({ mode: "create" });
  }

  function handleEditProperty(property: PropertyResponseDto) {
    setPropertyModal({ mode: "edit", property });
  }

  function handlePropertySaved(saved: PropertyResponseDto) {
    const exists = properties.some((p) => p.id === saved.id);
    if (exists) {
      applyPropertiesUpdate(properties.map((p) => (p.id === saved.id ? saved : p)));
    } else {
      applyPropertiesUpdate([...properties, saved]);
    }
  }

  function handleDeleteProperty(propId: string) {
    deleteProperty(propId).catch(showError);
  }

  if (!database) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-8 py-10">
      <div className="text-center mb-6">
        <p className="text-sm text-ink-muted mb-1">{t("title")}</p>
        <h1 className="type-page-title">{database.title || database.name}</h1>
      </div>

      <div className="flex justify-center mb-8">
        <TabSwitcher
          items={EDIT_TABS.map((tab) => ({ ...tab, label: t(tab.label as unknown as string) }))}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div>
        {activeTab === "general" && (
          <EditGeneralSection
            icon={icon}
            title={title}
            recordLimit={recordLimit}
            useDefaultTemplate={useDefaultTemplate}
            wrapCells={wrapCells}
            onIconChange={handleIconChange}
            onTitleChange={handleTitleChange}
            onTitleBlur={handleTitleBlur}
            onRecordLimitChange={handleRecordLimitChange}
            onUseDefaultTemplateChange={handleUseDefaultTemplateChange}
            onWrapCellsChange={setWrapCells}
          />
        )}

        {activeTab === "properties" && (
          <EditPropertiesSection
            properties={properties}
            databases={allDatabases}
            onAddProperty={handleAddProperty}
            onEditProperty={handleEditProperty}
            onDeleteProperty={handleDeleteProperty}
            onPropertiesChange={applyPropertiesUpdate}
            onPropertyUpdate={handlePropertyUpdate}
          />
        )}

        {activeTab === "templates" && <EditTemplatesSection database={database} />}
      </div>

      {propertyModal && database && (
        <PropertyFormModal
          mode={propertyModal.mode}
          databaseId={database.id}
          property={propertyModal.mode === "edit" ? propertyModal.property : undefined}
          existingGroups={existingGroups}
          databases={allDatabases}
          onClose={() => setPropertyModal(null)}
          onSaved={handlePropertySaved}
        />
      )}
    </div>
  );
}
