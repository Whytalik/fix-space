"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { useMutation } from "@/hooks/useMutation";
import { createSpace, deleteSpace, duplicateSpace, updateSpace } from "@/lib/api/space";
import { Badge } from "@/components/ui/primitives/badge";
import { Button } from "@/components/ui/primitives/button";
import { Check, ChevronDown, Copy, Globe, Pencil, Plus, Trash, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SpaceFormView } from "./space-form-view";

export function SpaceSwitcher() {
  const t = useTranslations("SpaceSwitcher");
  const { space, spaces, setSpace, addSpace, removeSpace, updateSpaceInList } = useAppContext();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "new" | "edit">("list");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [editingSpace, setEditingSpace] = useState<(typeof spaces)[0] | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  function handleClose() {
    setIsOpen(false);
    setView("list");
    setNewName("");
    setNewIcon("");
    setShowIconPicker(false);
    setEditingSpace(null);
    setEditName("");
    setEditIcon("");
  }

  useEscape(
    useCallback(() => {
      if (!isOpen) return;
      if (showIconPicker) setShowIconPicker(false);
      else handleClose();
    }, [isOpen, showIconPicker]),
  );

  async function handleDuplicate(event: React.MouseEvent<HTMLButtonElement>, spaceId: string) {
    event.stopPropagation();
    setDuplicatingId(spaceId);
    try {
      const duplicated = await duplicateSpace(spaceId);
      addSpace(duplicated);
      handleClose();
      router.push("/");
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleDelete(spaceId: string) {
    await deleteSpace(spaceId);
    removeSpace(spaceId);
    setConfirmDeleteId(null);
  }

  function handleEdit(s: (typeof spaces)[0]) {
    setEditingSpace(s);
    setEditName(s.name);
    setEditIcon(s.icon ?? "");
    setView("edit");
  }

  const {
    mutate: saveEdit,
    isLoading: isSaving,
    error: editError,
  } = useMutation(async () => {
    if (!editingSpace) return;
    const updated = await updateSpace(editingSpace.id, {
      name: editName.trim(),
      icon: editIcon.trim() || undefined,
    });
    updateSpaceInList(updated);
  });

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    const ok = await saveEdit();
    if (ok) setView("list");
  }

  const { mutate: createNewSpace, isLoading: isCreating } = useMutation(async () => {
    const created = await createSpace({ name: newName.trim(), icon: newIcon.trim() || undefined });
    addSpace(created);
    handleClose();
    router.push("/");
  });

  async function handleCreate() {
    if (!newName.trim()) return;
    await createNewSpace();
  }

  function handleSelectSpace(s: (typeof spaces)[0]) {
    setSpace(s);
    handleClose();
    router.push("/");
  }

  if (!space) return null;

  return (
    <>
      <span className="text-stroke mx-1">|</span>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-surface"
      >
        <span className="shrink-0 flex items-center text-ink-secondary">
          {space.icon ? <IconDisplay value={space.icon} size={18} /> : <Globe size={18} />}
        </span>
        <span className="text-sm text-ink">{space.name}</span>
        <ChevronDown size={12} className="text-ink-muted" />
      </button>

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

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
            onClick={handleClose}
          >
            <div
              className="w-105 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {view === "list" ? (
                <>
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                      {t("spaces")}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                      <X size={13} />
                    </Button>
                  </div>
                  <div className="px-2 pb-2 flex flex-col gap-0.5">
                    {spaces.map((s) => (
                      <div
                        key={s.id}
                        className={`group flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg hover:bg-surface ${s.id === space.id ? "bg-surface" : ""}`}
                      >
                        <button
                          onClick={() => handleSelectSpace(s)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <span className="shrink-0 flex items-center text-ink-secondary">
                            {s.icon ? <IconDisplay value={s.icon} size={18} /> : <Globe size={18} />}
                          </span>
                          <span className="text-sm text-ink truncate flex-1">{s.name}</span>
                          {s.isDefault && (
                            <Badge variant="accent" className="shrink-0 px-1.5 text-[10px]">
                              {t("default")}
                            </Badge>
                          )}
                          {s.id === space.id && <Check size={14} className="text-accent shrink-0" />}
                        </button>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(s);
                            }}
                            title={t("edit")}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDuplicate(e, s.id)}
                            disabled={duplicatingId === s.id}
                            title={t("duplicate")}
                          >
                            <Copy size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(s.id);
                            }}
                            disabled={spaces.length === 1 || s.isDefault}
                            title={s.isDefault ? t("cannotDeleteDefault") : t("delete")}
                            className="hover:text-red-400 disabled:hover:text-ink-secondary"
                          >
                            <Trash size={13} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stroke px-2 py-2">
                    <Button variant="ghost" onClick={() => setView("new")} className="w-full justify-center gap-2">
                      <Plus size={13} className="shrink-0" />
                      {t("newSpace")}
                    </Button>
                  </div>
                </>
              ) : view === "new" ? (
                <SpaceFormView
                  title={t("newSpaceTitle")}
                  name={newName}
                  icon={newIcon}
                  showIconPicker={showIconPicker}
                  iconButtonRef={iconButtonRef}
                  isLoading={isCreating}
                  submitLabel={t("addSpace")}
                  loadingLabel={t("creating")}
                  onNameChange={setNewName}
                  onSubmit={handleCreate}
                  onBack={() => setView("list")}
                  onToggleIconPicker={() => setShowIconPicker((v) => !v)}
                  onIconChange={setNewIcon}
                  onCloseIconPicker={() => setShowIconPicker(false)}
                />
              ) : (
                <SpaceFormView
                  title={t("editSpace")}
                  name={editName}
                  icon={editIcon}
                  showIconPicker={showIconPicker}
                  iconButtonRef={iconButtonRef}
                  isLoading={isSaving}
                  error={editError}
                  submitLabel={t("saveChanges")}
                  loadingLabel={t("saving")}
                  onNameChange={setEditName}
                  onSubmit={handleSaveEdit}
                  onBack={() => setView("list")}
                  onToggleIconPicker={() => setShowIconPicker((v) => !v)}
                  onIconChange={setEditIcon}
                  onCloseIconPicker={() => setShowIconPicker(false)}
                />
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
