"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Button } from "@/components/ui/primitives/actions/button";
import { updatePropertyGroup, createPropertyGroup } from "@/lib/api/property-group";
import { queryKeys } from "@/lib/api/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PropertyGroupResponseDto, PropertyResponseDto, VisibilityConditionDto } from "@fixspace/domain";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { VisibilityConditionEditor } from "./visibility-condition-editor";

interface GroupSettingsModalProps {
  groupName: string;
  databaseId: string;
  propertyGroups: PropertyGroupResponseDto[];
  properties: PropertyResponseDto[];
  onClose: () => void;
}

export function GroupSettingsModal({ groupName, databaseId, propertyGroups, properties, onClose }: GroupSettingsModalProps) {
  const t = useTranslations("GroupSettings");
  const queryClient = useQueryClient();
  const existing = propertyGroups.find((group) => group.name === groupName) ?? null;

  const [visibility, setVisibility] = useState<VisibilityConditionDto | null>(
    (existing?.visibility as VisibilityConditionDto | null | undefined) ?? null,
  );

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const resolvedVisibility = visibility?.dependsOnPropertyName ? visibility : null;
      if (existing) {
        return updatePropertyGroup(existing.id, { visibility: resolvedVisibility });
      }
      return createPropertyGroup(databaseId, groupName, resolvedVisibility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.propertyGroups.all(databaseId) });
      onClose();
    },
  });

  return (
    <ModalShell
      isOpen
      title={t("title", { name: groupName })}
      size="sm"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stroke">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button size="sm" onClick={() => save()} loading={isPending}>
            {t("save")}
          </Button>
        </div>
      }
    >
      <div className="px-6 py-5">
        <VisibilityConditionEditor value={visibility} properties={properties} onChange={setVisibility} />
      </div>
    </ModalShell>
  );
}
