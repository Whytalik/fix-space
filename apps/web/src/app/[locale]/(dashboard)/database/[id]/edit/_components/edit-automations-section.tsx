"use client";

import { useState } from "react";
import type { AutomationResponseDto } from "@fixspace/domain";
import { AutomationList } from "@/components/automation/automation-list";
import { AutomationForm } from "@/components/automation/automation-form";
import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditAutomationsSectionProps {
  databaseId: string;
}

export function EditAutomationsSection({ databaseId }: EditAutomationsSectionProps) {
  const t = useTranslations("Automation");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<AutomationResponseDto | null>(null);

  function handleClose() {
    setIsFormOpen(false);
    setEditingAutomation(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
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
          <AutomationForm databaseId={databaseId} automation={editingAutomation ?? undefined} initialMode="view" onSuccess={handleClose} />
        </ModalShell>
      )}
    </div>
  );
}
