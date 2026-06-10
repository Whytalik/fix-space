"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AutomationResponseDto } from "@fixspace/domain";
import { AutomationList } from "@/components/automation/automation-list";
import { AutomationForm } from "@/components/automation/automation-form";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { Plus } from "lucide-react";

export default function AutomationsPage() {
  const t = useTranslations("Automation");
  const { id: databaseId } = useParams<{ id: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<AutomationResponseDto | null>(null);

  function handleClose() {
    setIsFormOpen(false);
    setEditingAutomation(null);
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar px-8 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="type-page-title">{t("pageTitle")}</h1>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsFormOpen(true)}>
          {t("newAutomation")}
        </Button>
      </div>

      <AutomationList databaseId={databaseId} onEdit={(automation) => setEditingAutomation(automation)} />

      {(isFormOpen || editingAutomation) && (
        <ModalShell
          isOpen={isFormOpen || !!editingAutomation}
          onClose={handleClose}
          title={editingAutomation ? t("editAutomation") : t("newAutomation")}
          size="lg"
        >
          <AutomationForm databaseId={databaseId} automation={editingAutomation ?? undefined} onSuccess={handleClose} />
        </ModalShell>
      )}
    </div>
  );
}
