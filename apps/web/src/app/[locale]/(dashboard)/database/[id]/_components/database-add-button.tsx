"use client";

import { Button } from "@/components/ui/primitives/actions/button";
import { useDatabaseContext } from "@/context/database-context";
import { useUIContext } from "@/context/ui-context";
import { useTemplatesQuery } from "@/hooks/api/use-templates-query";
import { createRecord } from "@/lib/api/record";
import { useRouter } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TemplatePickerModal } from "./template-picker-modal";

export function DatabaseAddButton() {
  const t = useTranslations("DatabaseHeader");
  const router = useRouter();
  const { database, activeView, invalidateRecords } = useDatabaseContext();
  const { showError } = useUIContext();
  const { data: templates = [] } = useTemplatesQuery(database?.id || "");

  const [isCreating, setIsCreating] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  async function handleCreate(templateId: string | null = null) {
    if (!database) return;
    setShowPicker(false);
    try {
      setIsCreating(true);
      const created = await createRecord(database.id, {
        templateId,
        viewId: activeView?.id,
      });
      invalidateRecords();
      router.push(`/record/${created.id}`);
    } catch (error) {
      showError(error);
    } finally {
      setIsCreating(false);
    }
  }

  function handleClick() {
    let resolvedTemplateId: string | undefined = undefined;

    if (activeView?.useDefaultTemplate) {
      if (activeView.defaultTemplateId) {
        resolvedTemplateId = activeView.defaultTemplateId;
      } else {
        resolvedTemplateId = undefined;
      }
    } else {
      resolvedTemplateId = templates.find((t) => t.isDefault)?.id;
    }

    if (resolvedTemplateId) {
      handleCreate(resolvedTemplateId);
    } else if (templates.length > 0) {
      setShowPicker(true);
    } else {
      handleCreate(null);
    }
  }

  return (
    <>
      <Button size="sm" onClick={handleClick} loading={isCreating} disabled={isCreating} className="flex items-center gap-1.5">
        <Plus size={13} />
        {t("addItem")}
      </Button>

      {showPicker && <TemplatePickerModal templates={templates} onSelect={handleCreate} onClose={() => setShowPicker(false)} />}
    </>
  );
}
