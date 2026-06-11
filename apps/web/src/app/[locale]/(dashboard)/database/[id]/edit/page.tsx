"use client";

import { TabSwitcher, type TabItem } from "@/components/ui/primitives/navigation/tab-switcher";
import { PageLoader } from "@/components/ui/primitives/feedback/page-loader";
import { useAppContext } from "@/context/app-context";
import { useDatabaseContext } from "@/context/database-context";
import { useUIContext } from "@/context/ui-context";
import { updateDatabase } from "@/lib/api/database";
import { deleteProperty, updateProperty } from "@/lib/api/property";
import type { PropertyResponseDto } from "@fixspace/domain";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const { database, properties, applyDatabaseUpdate, applyPropertiesUpdate } = useDatabaseContext();
  const { updateDatabaseInSpace, databases: allDatabases } = useAppContext();
  const { showError } = useUIContext();
  const t = useTranslations("DatabaseEdit");

  const [activeTab, setActiveTab] = useState<EditTab>(() => {
    const tab = searchParams.get("tab");
    return tab === "properties" ? tab : "general";
  });
  const [icon, setIcon] = useState(() => database?.icon ?? "");
  const [title, setTitle] = useState(() => database?.title ?? "");
  const [isLocked, setIsLocked] = useState(() => database?.isLocked ?? false);
  const [propertyModal, setPropertyModal] = useState<{ mode: "create" } | { mode: "edit"; property: PropertyResponseDto } | null>(null);

  useEffect(() => {
    if (!database) return;
    setIcon(database.icon ?? "");
    setTitle(database.title ?? "");
    setIsLocked(database.isLocked ?? false);
  }, [database]);
  async function saveDatabase(patch: Partial<{ icon: string; title: string; isLocked: boolean }>) {
    if (!database) return;
    try {
      const updated = await updateDatabase(database.spaceId, database.id, {
        icon: (patch.icon !== undefined ? patch.icon : icon) || undefined,
        title: patch.title !== undefined ? patch.title : title,
        name: `${DB_PREFIX}${patch.title !== undefined ? patch.title : title}`,
        isLocked: patch.isLocked !== undefined ? patch.isLocked : isLocked,
      });
      applyDatabaseUpdate(updated);
      updateDatabaseInSpace(updated);
    } catch (error) {
      showError(error);
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleTitleBlur() {
    saveDatabase({ title });
  }

  function handleIconChange(value: string) {
    setIcon(value);
    saveDatabase({ icon: value });
  }

  function handleIsLockedChange(value: boolean) {
    setIsLocked(value);
    saveDatabase({ isLocked: value });
  }

  function handlePropertyUpdate(propertyId: string, data: Partial<{ position: number; group: string | null; isVisible: boolean }>) {
    applyPropertiesUpdate(properties.map((property) => (property.id === propertyId ? { ...property, ...data } : property)));
    updateProperty(propertyId, data).catch(showError);
  }

  const existingGroups = [...new Set(properties.map((property) => property.group).filter(Boolean) as string[])];

  function handleAddProperty() {
    setPropertyModal({ mode: "create" });
  }

  function handleEditProperty(property: PropertyResponseDto) {
    setPropertyModal({ mode: "edit", property });
  }

  function handlePropertySaved(saved: PropertyResponseDto) {
    const exists = properties.some((property) => property.id === saved.id);
    if (exists) {
      applyPropertiesUpdate(properties.map((property) => (property.id === saved.id ? saved : property)));
    } else {
      applyPropertiesUpdate([...properties, saved]);
    }
  }

  function handleDeleteProperty(propertyId: string) {
    deleteProperty(propertyId).catch(showError);
  }

  if (!database) {
    return <PageLoader className="flex-1" />;
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar px-8 py-10 animate-fade-up">
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
            isLocked={isLocked}
            onIconChange={handleIconChange}
            onTitleChange={handleTitleChange}
            onTitleBlur={handleTitleBlur}
            onIsLockedChange={handleIsLockedChange}
          />
        )}

        {activeTab === "properties" && (
          <EditPropertiesSection
            properties={properties.filter((p) => !(p.position === 0 && p.type === "TEXT"))}
            databases={allDatabases}
            isLocked={isLocked}
            isPreset={!!database.isPreset}
            onAddProperty={handleAddProperty}
            onEditProperty={handleEditProperty}
            onDeleteProperty={handleDeleteProperty}
            onPropertiesChange={(updated) => {
              const nameProp = properties.find((p) => p.position === 0 && p.type === "TEXT");
              if (nameProp) {
                applyPropertiesUpdate([nameProp, ...updated]);
              } else {
                applyPropertiesUpdate(updated);
              }
            }}
            onPropertyUpdate={handlePropertyUpdate}
          />
        )}

        {activeTab === "templates" && <EditTemplatesSection databaseId={database.id} isLocked={isLocked} />}
      </div>

      {propertyModal && database && (
        <PropertyFormModal
          mode={propertyModal.mode}
          databaseId={database.id}
          property={propertyModal.mode === "edit" ? propertyModal.property : undefined}
          properties={properties}
          existingGroups={existingGroups}
          databases={allDatabases}
          onClose={() => setPropertyModal(null)}
          onSaved={handlePropertySaved}
        />
      )}
    </div>
  );
}
