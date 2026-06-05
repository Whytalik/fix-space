"use client";

import { NameIconColorModal } from "@/components/ui/overlays/name-icon-color-modal";
import { useAppContext } from "@/context/app-context";
import { getSectionSettings } from "@/lib/api/settings";
import { updateSpace } from "@/lib/api/space";
import { DEFAULT_SECTION_SETTINGS } from "@fixspace/domain/enums";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

type AddSectionModalProps = {
  onClose: () => void;
};

export function AddSectionModal({ onClose }: AddSectionModalProps) {
  const t = useTranslations("AddSection");
  const { space, updateSpaceInList } = useAppContext();

  const { data: settings } = useQuery({
    queryKey: ["settings", "section"],
    queryFn: getSectionSettings,
    initialData: DEFAULT_SECTION_SETTINGS,
  });

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

  return (
    <NameIconColorModal
      title={t("title")}
      placeholder={t("placeholder")}
      submitLabel={isCreating ? t("creating") : t("add")}
      initialValues={{ icon: settings.defaultSectionIcon, color: settings.defaultSectionColor }}
      isSubmitting={isCreating}
      onSubmit={(values) => createSection(values)}
      onClose={onClose}
    />
  );
}
