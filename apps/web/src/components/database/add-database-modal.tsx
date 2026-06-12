"use client";

import { NameIconColorModal } from "@/components/ui/overlays/name-icon-color-modal";
import { useAppContext } from "@/context/app-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "@/lib/api/client";
import { createDatabase, restorePreset } from "@/lib/api/database";
import { useDatabaseSettingsQuery } from "@/hooks/api/use-database-settings-query";
import { useAvailablePresetsQuery } from "@/hooks/api/use-available-presets-query";
import { DEFAULT_DATABASE_SETTINGS } from "@fixspace/domain/enums";
import type { DatabaseType } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Button } from "@/components/ui/primitives/actions/button";

interface AddDatabaseModalProps {
  spaceId: string;
  sectionId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AddDatabaseModal({ spaceId, sectionId, onClose, onSaved }: AddDatabaseModalProps) {
  const t = useTranslations("AddDatabaseModal");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addDatabaseToSpace } = useAppContext();

  const { data: settings, isLoading: isSettingsLoading } = useDatabaseSettingsQuery();
  const { data: availablePresets, isLoading: isPresetsLoading } = useAvailablePresetsQuery();

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

  const { mutate: restore, isPending: isRestoring } = useMutation({
    mutationFn: (type: DatabaseType) =>
      restorePreset({
        type,
        spaceId,
        sectionId,
      }),
    onSuccess: (created) => {
      addDatabaseToSpace(created);
      queryClient.invalidateQueries({ queryKey: ["available-presets"] });
      onSaved();
      router.push(`/database/${created.id}`);
    },
  });

  const error = mutationError ? parseApiError(mutationError) : null;

  if (isSettingsLoading || isPresetsLoading) return null;

  const actualSettings = settings ?? DEFAULT_DATABASE_SETTINGS;
  const hasPresets = availablePresets && availablePresets.length > 0;

  return (
    <NameIconColorModal
      title={t("addDatabase")}
      placeholder={t("placeholderTitle")}
      submitLabel={isSaving ? t("creating") : t("createDatabase")}
      initialValues={{ icon: actualSettings.defaultDatabaseIcon }}
      isSubmitting={isSaving || isRestoring}
      hideColor
      error={error}
      onSubmit={(values) => save(values)}
      onClose={onClose}
    >
      {hasPresets && (
        <div className="flex flex-col gap-2 mb-1">
          <label className="type-field-label">{t("restorePreset") || "Restore Preset"}</label>
          <div className="flex flex-col gap-1.5">
            {availablePresets.map((preset) => (
              <Button
                key={preset.type}
                variant="secondary"
                size="sm"
                className="justify-start gap-2 h-9 px-3"
                loading={isRestoring}
                onClick={() => restore(preset.type)}
              >
                <IconDisplay value={preset.icon} size={16} />
                <span className="flex-1 text-left">{t(`presets.${preset.type}`) || preset.title}</span>
              </Button>
            ))}
          </div>
          <div className="h-px bg-stroke my-2" />
        </div>
      )}
    </NameIconColorModal>
  );
}
