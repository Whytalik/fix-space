"use client";

import { NameIconColorModal } from "@/components/ui/overlays/name-icon-color-modal";
import { useAppContext } from "@/context/app-context";
import { updateSpace } from "@/lib/api/space";
import type { SectionResponseDto } from "@fixspace/domain";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface SectionEditModalProps {
  section: SectionResponseDto;
  onClose: () => void;
}

export function SectionEditModal({ section, onClose }: SectionEditModalProps) {
  const t = useTranslations("SectionEdit");
  const { space, updateSpaceInList } = useAppContext();

  const { mutate: saveEdit, isPending: isSaving } = useMutation({
    mutationFn: async (values: { name: string; icon: string; color: string }) => {
      if (!space) return;
      return updateSpace(space.id, {
        sectionOperations: [
          {
            operation: "UPDATE",
            id: section.id,
            update: {
              name: values.name,
              icon: values.icon || undefined,
              color: values.color || undefined,
            },
          },
        ],
      });
    },
    onSuccess: (updated) => {
      if (updated) {
        updateSpaceInList(updated);
        onClose();
      }
    },
  });

  return (
    <NameIconColorModal
      title={t("title")}
      placeholder={t("placeholder")}
      submitLabel={isSaving ? t("saving") : t("save")}
      initialValues={{ name: section.name, icon: section.icon ?? "", color: section.color ?? "" }}
      isSubmitting={isSaving}
      onSubmit={(values) => saveEdit(values)}
      onClose={onClose}
    />
  );
}
