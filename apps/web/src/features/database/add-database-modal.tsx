"use client";

import { NameIconColorModal } from "@/components/ui/overlays/name-icon-color-modal";
import { useAppContext } from "@/context/app-context";
import { useMutation } from "@tanstack/react-query";
import { parseApiError } from "@/lib/api/client";
import { createDatabase } from "@/lib/api/database";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface AddDatabaseModalProps {
  spaceId: string;
  sectionId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AddDatabaseModal({ spaceId, sectionId, onClose, onSaved }: AddDatabaseModalProps) {
  const t = useTranslations("AddDatabaseModal");
  const router = useRouter();
  const { addDatabaseToSpace } = useAppContext();

  const {
    mutate: save,
    isPending: isSaving,
    error: mutationError,
  } = useMutation({
    mutationFn: (values: { name: string; icon: string }) =>
      createDatabase(spaceId, {
        icon: values.icon || undefined,
        sectionId,
        title: values.name,
        name: `[DB] ${values.name}`,
      }),
    onSuccess: (created) => {
      addDatabaseToSpace(created);
      onSaved();
      router.push(`/database/${created.id}/edit`);
    },
  });

  const error = mutationError ? parseApiError(mutationError) : null;

  return (
    <NameIconColorModal
      title={t("addDatabase")}
      placeholder={t("placeholderTitle")}
      submitLabel={isSaving ? t("creating") : t("createDatabase")}
      isSubmitting={isSaving}
      hideColor
      error={error}
      onSubmit={(values) => save(values)}
      onClose={onClose}
    />
  );
}
