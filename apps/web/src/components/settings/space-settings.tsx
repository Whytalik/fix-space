"use client";

import { getAllIcons, IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/components/ui/primitives/button";
import { Spinner } from "@/components/ui/primitives/spinner";
import { TabSwitcher, type TabItem } from "@/components/ui/primitives/tab-switcher";
import { TextInput } from "@/components/ui/primitives/text-input";
import { Toast } from "@/components/ui/primitives/toast";
import { useAppContext } from "@/context/app-context";
import { useMutation } from "@/hooks/useMutation";
import { parseApiError } from "@/lib/api/client";
import { getSpaceSettings, updateSpaceSettings } from "@/lib/api/settings";
import { deleteSpace, duplicateSpace, updateSpace } from "@/lib/api/space";
import type { SpaceSettings as SpaceSettingsDto } from "@fixspace/domain";
import { Copy, Globe, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function SpaceSettings() {
  const t = useTranslations("SpaceSettingsComp");
  const { spaces, updateSpaceInList, addSpace, removeSpace } = useAppContext();

  const spaceTabs: TabItem<"sidebar" | "datetime">[] = [
    { id: "sidebar", label: t("sidebar") },
    { id: "datetime", label: t("datetime") },
  ];

  const timeFormatTabs: TabItem<"12h" | "24h">[] = [
    { id: "12h", label: t("timeFormat12h") },
    { id: "24h", label: t("timeFormat24h") },
  ];

  const startOfWeekTabs: TabItem<"0" | "1">[] = [
    { id: "1", label: t("monday") },
    { id: "0", label: t("sunday") },
  ];

  const [activeTab, setActiveTab] = useState<"sidebar" | "datetime">("sidebar");
  const [form, setForm] = useState<SpaceSettingsDto | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editIconButtonRef = useRef<HTMLButtonElement>(null);

  async function handleSetDefault(spaceId: string) {
    setIsSettingDefault(spaceId);
    try {
      const updated = await updateSpace(spaceId, { name: spaces.find((s) => s.id === spaceId)?.name ?? "" });
      const prevDefault = spaces.find((s) => (s as { isDefault?: boolean }).isDefault && s.id !== spaceId);
      if (prevDefault) updateSpaceInList({ ...prevDefault });
      updateSpaceInList(updated);
      setToast({ message: t("defaultUpdated"), variant: "success" });
    } catch (err) {
      setToast({ message: parseApiError(err), variant: "error" });
    } finally {
      setIsSettingDefault(null);
    }
  }

  function handleEditStart(s: (typeof spaces)[0]) {
    setEditingId(s.id);
    setEditName(s.name);
    setEditIcon(s.icon ?? "");
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
    isLoading: isSavingEdit,
    error: editError,
  } = useMutation(async () => {
    if (!editingId) return;
    const updated = await updateSpace(editingId, {
      name: editName.trim(),
      icon: editIcon.trim() || undefined,
    });
    updateSpaceInList(updated);
    setEditingId(null);
  });

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    await saveEdit();
  }

  async function handleDuplicate(spaceId: string) {
    setDuplicatingId(spaceId);
    try {
      const duplicated = await duplicateSpace(spaceId);
      addSpace(duplicated);
      setToast({ message: t("spaceDuplicated"), variant: "success" });
    } catch (err) {
      setToast({ message: parseApiError(err), variant: "error" });
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleDelete(spaceId: string) {
    try {
      await deleteSpace(spaceId);
      removeSpace(spaceId);
      setConfirmDeleteId(null);
      setToast({ message: t("spaceDeleted"), variant: "success" });
    } catch (err) {
      setToast({ message: parseApiError(err), variant: "error" });
      setConfirmDeleteId(null);
    }
  }

  useEffect(() => {
    getSpaceSettings()
      .then(setForm)
      .finally(() => setIsFetching(false));
  }, []);

  async function handleSave() {
    if (!form) return;
    setIsSaving(true);
    try {
      const updated = await updateSpaceSettings(form);
      setForm(updated);
      setToast({ message: t("settingsSaved"), variant: "success" });
    } catch (err) {
      setToast({ message: parseApiError(err), variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isFetching || !form) {
    return <Spinner size="sm" className="mx-auto mt-4" />;
  }

  return (
    <div>
      <div className="mb-6">
        <TabSwitcher items={spaceTabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "sidebar" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("spaces")}</label>
            <div className="flex flex-col rounded-lg border border-stroke overflow-hidden">
              {spaces.map((s, i) =>
                editingId === s.id ? (
                  <div
                    key={s.id}
                    className={`flex flex-col gap-2 px-3 py-2${i < spaces.length - 1 ? " border-b border-stroke" : ""}`}
                  >
                    <div className="flex gap-2 items-center">
                      <button
                        ref={editIconButtonRef}
                        type="button"
                        onClick={() => setShowEditIconPicker((v) => !v)}
                        className="w-8 h-8 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent transition-colors shrink-0"
                      >
                        {editIcon ? <IconDisplay value={editIcon} size={16} /> : <Globe size={16} />}
                      </button>
                      {showEditIconPicker && (
                        <IconPicker
                          value={editIcon}
                          onChange={(v) => {
                            setEditIcon(v);
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
                    key={s.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm text-ink${i < spaces.length - 1 ? " border-b border-stroke" : ""}`}
                  >
                    <span className="flex items-center justify-center w-5 h-5 text-ink-secondary">
                      {s.icon ? <IconDisplay value={s.icon} size={18} /> : <Globe size={18} />}
                    </span>
                    <span className="flex-1">{s.name}</span>
                    {s.isDefault && <Badge variant="accent">{t("default")}</Badge>}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={s.isDefault || isSettingDefault !== null}
                      onClick={() => handleSetDefault(s.id)}
                    >
                      {isSettingDefault === s.id ? t("saving") : t("setAsDefault")}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditStart(s)} title={t("edit")}>
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(s.id)}
                      disabled={duplicatingId === s.id}
                      title={t("duplicate")}
                    >
                      <Copy size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDeleteId(s.id)}
                      disabled={spaces.length === 1 || s.isDefault}
                      title={s.isDefault ? t("cannotDeleteDefault") : t("delete")}
                      className="hover:text-red-400 disabled:hover:text-ink-secondary"
                    >
                      <Trash size={13} />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("defaultIcon")}</label>
            <div>
              <button
                ref={iconButtonRef}
                type="button"
                onClick={() => setShowIconPicker((v) => !v)}
                className="flex items-center gap-2.5 rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
              >
                {form.defaultSpaceIcon ? (
                  <span className="flex items-center gap-2">
                    <IconDisplay value={form.defaultSpaceIcon} size={16} />
                    <span className="text-xs text-ink-secondary">
                      {getAllIcons().find((i) => `icon:${i.name}` === form.defaultSpaceIcon)?.displayName}
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-muted">{t("chooseIcon")}</span>
                )}
              </button>
              {showIconPicker && (
                <IconPicker
                  value={form.defaultSpaceIcon}
                  onChange={(v) => {
                    setForm((p) => (p ? { ...p, defaultSpaceIcon: v } : p));
                    setShowIconPicker(false);
                  }}
                  onClose={() => setShowIconPicker(false)}
                  anchorEl={iconButtonRef.current}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "datetime" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("timeFormat")}</label>
            <TabSwitcher
              items={timeFormatTabs}
              active={form.timeFormat}
              onChange={(v) => setForm((p) => (p ? { ...p, timeFormat: v } : p))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("startOfWeek")}</label>
            <TabSwitcher
              items={startOfWeekTabs}
              active={String(form.startOfWeek) as "0" | "1"}
              onChange={(v) => setForm((p) => (p ? { ...p, startOfWeek: Number(v) as 0 | 1 } : p))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("dateFormat")}</label>
            <TextInput
              value={form.dateFormat}
              onChange={(v) => setForm((p) => (p ? { ...p, dateFormat: v } : p))}
              placeholder={t("placeholderDateFormat")}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title={t("deleteSpace")}
          description={t("deleteSpaceDesc")}
          confirmLabel={t("delete")}
          variant="danger"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
    </div>
  );
}
