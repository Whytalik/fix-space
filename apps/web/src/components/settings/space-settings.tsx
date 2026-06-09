"use client";

import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { DuplicationModal, type DuplicationOptions } from "@/components/ui/overlays/duplication-modal";
import { Badge } from "@/components/ui/primitives/display/badge";
import { Button } from "@/components/ui/primitives/actions/button";
import { Spinner } from "@/components/ui/primitives/feedback/spinner";
import { Toggle } from "@/components/ui/primitives/inputs/toggle";
import { useAppContext } from "@/context/app-context";
import { useUIContext } from "@/context/ui-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "@/lib/api/client";
import { useSpaceSettingsQuery } from "@/hooks/api/use-space-settings-query";
import { updateSpaceSettings } from "@/lib/api/settings";
import { createSpace, deleteSpace, duplicateSpace, updateSpace } from "@/lib/api/space";
import type { SpaceSettings as SpaceSettingsDto } from "@fixspace/domain";
import { Copy, Globe, Pencil, Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function SpaceSettings() {
  const t = useTranslations("SpaceSettingsComp");
  const { spaces, updateSpaceInList, addSpace, removeSpace } = useAppContext();
  const { showToast } = useUIContext();
  const queryClient = useQueryClient();

  const { data: fetchedSettings, isLoading } = useSpaceSettingsQuery();
  const [form, setForm] = useState<SpaceSettingsDto | null>(null);
  const initialSettings = useRef<SpaceSettingsDto | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [duplicatingSpace, setDuplicatingSpace] = useState<(typeof spaces)[0] | null>(null);
  const editIconButtonRef = useRef<HTMLButtonElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [showNewIconPicker, setShowNewIconPicker] = useState(false);
  const newIconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (fetchedSettings) {
      setForm(fetchedSettings);
      if (!initialSettings.current) {
        initialSettings.current = fetchedSettings;
      }
    }
  }, [fetchedSettings]);

  const { mutate: saveSettings } = useMutation({
    mutationFn: () => updateSpaceSettings(form!),
    onSuccess: (updated) => {
      setForm(updated);
      initialSettings.current = updated;
      showToast(t("settingsSaved"), "success");
      queryClient.invalidateQueries({ queryKey: ["settings", "space"] });
    },
    onError: (error) => {
      showToast(parseApiError(error), "error");
    },
  });

  useEffect(() => {
    if (!form || !initialSettings.current) {
      return;
    }

    if (JSON.stringify(form) === JSON.stringify(initialSettings.current)) {
      return;
    }

    const timer = setTimeout(() => {
      saveSettings();
    }, 600);

    return () => clearTimeout(timer);
  }, [form, saveSettings]);

  const { mutate: setDefaultSpace, isPending: isSettingDefault } = useMutation({
    mutationFn: (spaceId: string) => updateSpace(spaceId, { name: spaces.find((space) => space.id === spaceId)?.name ?? "" }),
    onSuccess: (updated) => {
      updateSpaceInList(updated);
      showToast(t("defaultUpdated"), "success");
    },
    onError: (error) => {
      showToast(parseApiError(error), "error");
    },
  });

  function handleEditStart(space: (typeof spaces)[0]) {
    setEditingId(space.id);
    setEditName(space.name);
    setEditIcon(space.icon ?? "");
    setShowEditIconPicker(false);
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
    setShowEditIconPicker(false);
  }

  const {
    mutate: saveEdit,
    isPending: isSavingEdit,
    error: editErrorObject,
  } = useMutation({
    mutationFn: async () => {
      if (!editingId) return;
      return updateSpace(editingId, {
        name: editName.trim(),
        icon: editIcon.trim() || undefined,
      });
    },
    onSuccess: (updated) => {
      if (updated) {
        updateSpaceInList(updated);
        setEditingId(null);
      }
    },
  });

  const editError = editErrorObject ? parseApiError(editErrorObject) : null;

  function handleSaveEdit() {
    if (!editName.trim()) return;
    saveEdit();
  }

  const { mutate: duplicateSpaceAction, isPending: isDuplicating } = useMutation({
    mutationFn: ({ spaceId, options }: { spaceId: string; options: DuplicationOptions }) =>
      duplicateSpace(spaceId, {
        newName: options.newName,
        includeSections: options.includeSections,
        includeDatabases: options.includeDatabases,
        includeProperties: options.includeProperties,
        includeTemplates: options.includeTemplates,
        includeAutomations: options.includeAutomations,
      }),
    onSuccess: (duplicated) => {
      addSpace(duplicated);
      setDuplicatingSpace(null);
      showToast(t("spaceDuplicated"), "success");
    },
    onError: (error) => {
      showToast(parseApiError(error), "error");
    },
  });

  const {
    mutate: createSpaceAction,
    isPending: isCreatingSpace,
    error: createErrorObject,
  } = useMutation({
    mutationFn: () => createSpace({ name: newName.trim(), icon: newIcon.trim() || undefined }),
    onSuccess: (created) => {
      addSpace(created);
      setIsCreating(false);
      setNewName("");
      setNewIcon("");
      showToast(t("spaceCreated"), "success");
    },
    onError: (error) => {
      showToast(parseApiError(error), "error");
    },
  });

  const createError = createErrorObject ? parseApiError(createErrorObject) : null;

  function handleCreateCancel() {
    setIsCreating(false);
    setNewName("");
    setNewIcon("");
    setShowNewIconPicker(false);
  }

  const { mutate: deleteSpaceAction } = useMutation({
    mutationFn: (spaceId: string) => deleteSpace(spaceId),
    onSuccess: (_, spaceId) => {
      removeSpace(spaceId);
      setConfirmDeleteId(null);
      showToast(t("spaceDeleted"), "success");
    },
    onError: (error) => {
      showToast(parseApiError(error), "error");
      setConfirmDeleteId(null);
    },
  });

  if (isLoading || !form) {
    return <Spinner size="sm" className="mx-auto mt-4" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm text-ink-secondary">{t("spaces")}</label>
          <Button variant="ghost" size="icon" onClick={() => setIsCreating(true)} title={t("addSpace")} disabled={isCreating}>
            <Plus size={14} />
          </Button>
        </div>
        <div className="flex flex-col rounded-lg border border-stroke overflow-hidden">
          {spaces.map((space, i) =>
            editingId === space.id ? (
              <div key={space.id} className={`flex flex-col gap-2 px-3 py-2${i < spaces.length - 1 ? " border-b border-stroke" : ""}`}>
                <div className="flex gap-2 items-center">
                  <button
                    ref={editIconButtonRef}
                    type="button"
                    onClick={() => setShowEditIconPicker((prev) => !prev)}
                    className="w-8 h-8 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent transition-colors duration-150 shrink-0"
                  >
                    {editIcon ? <IconDisplay value={editIcon} size={16} /> : <Globe size={16} />}
                  </button>
                  {showEditIconPicker && (
                    <IconPicker
                      value={editIcon}
                      onChange={(value) => {
                        setEditIcon(value);
                        setShowEditIconPicker(false);
                      }}
                      onClose={() => setShowEditIconPicker(false)}
                      anchorEl={editIconButtonRef.current}
                    />
                  )}
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") handleEditCancel();
                    }}
                    className="flex-1 bg-surface border border-stroke rounded-lg px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEdit} disabled={!editName.trim() || isSavingEdit}>
                    {isSavingEdit ? t("saving") : t("save")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleEditCancel}>
                    {t("cancel")}
                  </Button>
                </div>
                {editError && <p className="text-xs text-error">{editError}</p>}
              </div>
            ) : (
              <div
                key={space.id}
                className={`flex items-center gap-2 px-3 py-2 text-sm text-ink${i < spaces.length - 1 ? " border-b border-stroke" : ""}`}
              >
                <span className="flex items-center justify-center w-5 h-5 text-ink-secondary">
                  {space.icon ? <IconDisplay value={space.icon} size={18} /> : <Globe size={18} />}
                </span>
                <span className="flex-1">{space.name}</span>
                {space.isDefault && <Badge variant="accent">{t("default")}</Badge>}
                {!space.isDefault && (
                  <Button variant="ghost" size="sm" disabled={isSettingDefault} onClick={() => setDefaultSpace(space.id)}>
                    {t("setAsDefault")}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleEditStart(space)} title={t("edit")}>
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDuplicatingSpace(space)}
                  disabled={isDuplicating}
                  title={t("duplicate")}
                >
                  <Copy size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDeleteId(space.id)}
                  disabled={spaces.length === 1 || space.isDefault}
                  title={space.isDefault ? t("cannotDeleteDefault") : t("delete")}
                  className="hover:text-error disabled:hover:text-ink-secondary"
                >
                  <Trash size={13} />
                </Button>
              </div>
            ),
          )}
          {isCreating && (
            <div className={`flex flex-col gap-2 px-3 py-2${spaces.length > 0 ? " border-t border-stroke" : ""}`}>
              <div className="flex gap-2 items-center">
                <button
                  ref={newIconButtonRef}
                  type="button"
                  onClick={() => setShowNewIconPicker((prev) => !prev)}
                  className="w-8 h-8 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent transition-colors duration-150 shrink-0"
                >
                  {newIcon ? <IconDisplay value={newIcon} size={16} /> : <Globe size={16} />}
                </button>
                {showNewIconPicker && (
                  <IconPicker
                    value={newIcon}
                    onChange={(value) => {
                      setNewIcon(value);
                      setShowNewIconPicker(false);
                    }}
                    onClose={() => setShowNewIconPicker(false)}
                    anchorEl={newIconButtonRef.current}
                  />
                )}
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newName.trim()) createSpaceAction();
                    if (e.key === "Escape") handleCreateCancel();
                  }}
                  placeholder={t("placeholderSpaceName")}
                  className="flex-1 bg-surface border border-stroke rounded-lg px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
                  autoFocus
                />
                <Button size="sm" onClick={() => createSpaceAction()} disabled={!newName.trim() || isCreatingSpace}>
                  {isCreatingSpace ? t("saving") : t("create")}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCreateCancel}>
                  {t("cancel")}
                </Button>
              </div>
              {createError && <p className="text-xs text-error">{createError}</p>}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-ink-secondary">{t("defaultIcon")}</label>
        <div>
          <button
            ref={iconButtonRef}
            type="button"
            onClick={() => setShowIconPicker((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
          >
            {form.defaultSpaceIcon ? (
              <span className="flex items-center gap-2">
                <IconDisplay value={form.defaultSpaceIcon} size={16} />
                <span className="text-xs text-ink-secondary">
                  {getAllIcons().find((icon) => `icon:${icon.name}` === form.defaultSpaceIcon)?.displayName}
                </span>
              </span>
            ) : (
              <span className="text-ink-muted">{t("chooseIcon")}</span>
            )}
          </button>
          {showIconPicker && (
            <IconPicker
              value={form.defaultSpaceIcon}
              onChange={(value) => {
                setForm((prev) => (prev ? { ...prev, defaultSpaceIcon: value } : prev));
                setShowIconPicker(false);
              }}
              onClose={() => setShowIconPicker(false)}
              anchorEl={iconButtonRef.current}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 pt-2">
        <div className="flex items-center justify-between py-2 border-y border-stroke/50">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-ink">{t("showPresetIndicators")}</label>
            <p className="text-xs text-ink-muted">{t("showPresetIndicatorsDesc")}</p>
          </div>
          <Toggle
            value={form.showPresetIndicators}
            onChange={(value) => setForm((prev) => (prev ? { ...prev, showPresetIndicators: value } : prev))}
          />
        </div>
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title={t("deleteSpace")}
          description={t("deleteSpaceDesc")}
          confirmLabel={t("delete")}
          variant="danger"
          onConfirm={() => deleteSpaceAction(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {duplicatingSpace && (
        <DuplicationModal
          target="workspace"
          initialName={`${duplicatingSpace.name} (Copy)`}
          onConfirm={async (options) => {
            duplicateSpaceAction({ spaceId: duplicatingSpace.id, options });
          }}
          onCancel={() => setDuplicatingSpace(null)}
        />
      )}
    </div>
  );
}
