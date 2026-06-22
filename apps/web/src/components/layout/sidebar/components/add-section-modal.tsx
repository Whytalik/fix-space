"use client";

import { NameIconColorModal } from "@/components/ui/overlays/name-icon-color-modal";
import { useAppContext } from "@/context/app-context";
import { useSectionSettingsQuery } from "@/hooks/api/use-section-settings-query";
import { updateSpace } from "@/lib/api/space";
import { DEFAULT_SECTION_SETTINGS } from "@fixspace/domain";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

type AddSectionModalProps = {
  onClose: () => void;
};

export function AddSectionModal({ onClose }: AddSectionModalProps) {
  const t = useTranslations("AddSection");
  const { space, updateSpaceInList } = useAppContext();

  const { data: settings, isLoading } = useSectionSettingsQuery();

  const { mutate: createSection, isPending: isCreating } = useMutation({
    mutationFn: async (values: { name: string; icon: string; color: string }) => {
      if (!space) return;
      return updateSpace(space.id, {
        sectionOperations: [
          {
            operation: "CREATE",
            create: {
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

  if (isLoading) return null;

  const actualSettings = settings ?? DEFAULT_SECTION_SETTINGS;

  return (
    <NameIconColorModal
      title={t("title")}
      placeholder={t("placeholder")}
      submitLabel={isCreating ? t("creating") : t("add")}
      initialValues={{ icon: actualSettings.defaultSectionIcon, color: actualSettings.defaultSectionColor }}
      isSubmitting={isCreating}
      onSubmit={(values) => createSection(values)}
      onClose={onClose}
    />
  );
}
