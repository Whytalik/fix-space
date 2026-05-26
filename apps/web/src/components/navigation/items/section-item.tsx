"use client";

import { DatabaseItem } from "@/components/navigation/items/database-item";
import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { DropdownMenu } from "@/components/ui/overlays/dropdown-menu";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { useModal } from "@/hooks/useModal";
import { useMutation } from "@/hooks/useMutation";
import { updateSpace } from "@/lib/api/space";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/button";
import { ChevronRight, LayoutGrid, MoreHorizontal, Pencil, Smile, Trash, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AddDatabaseModal } from "@/components/database/add-database-modal";

interface SectionItemProps {
  section: SectionResponseDto;
  collapsed?: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SectionItem({ section, collapsed, isCollapsed, onToggle }: SectionItemProps) {
  const t = useTranslations("SectionItem");
  const { space, updateSpaceInList } = useAppContext();
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({
    id: section.id,
    data: { type: "section" },
    disabled: !!collapsed,
  });

  const style = {
    transform: transform ? CSS.Transform.toString({ ...transform, x: 0 }) : undefined,
    transition,
  };

  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const addDatabase = useModal();

  function openEdit() {
    setEditName(section.name);
    setEditIcon(section.icon ?? "");
    setEditColor(section.color ?? "");
    setShowEditModal(true);
    setShowMenu(false);
  }

  function closeEdit() {
    setShowEditModal(false);
    setShowIconPicker(false);
    setShowColorPicker(false);
  }

  useEscape(
    useCallback(() => {
      if (!showEditModal) return;
      if (showIconPicker) setShowIconPicker(false);
      else if (showColorPicker) setShowColorPicker(false);
      else closeEdit();
    }, [showEditModal, showIconPicker, showColorPicker]),
  );

  const { mutate: saveEdit, isLoading: isSaving } = useMutation(async () => {
    if (!space) return;
    const updated = await updateSpace(space.id, {
      sectionOperations: [
        {
          operation: "UPDATE",
          id: section.id,
          update: {
            name: editName.trim(),
            icon: editIcon.trim() || undefined,
            color: editColor.trim() || undefined,
          },
        },
      ],
    });
    updateSpaceInList(updated);
  });

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    const ok = await saveEdit();
    if (ok) closeEdit();
  }

  const { mutate: deleteSection, isLoading: isDeleting } = useMutation(async () => {
    if (!space) return;
    const updated = await updateSpace(space.id, {
      sectionOperations: [{ operation: "DELETE", id: section.id }],
    });
    updateSpaceInList(updated);
  });

  async function handleDelete() {
    const ok = await deleteSection();
    if (ok) setShowDeleteConfirm(false);
  }

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setShowMenu((v) => !v);
  }

  if (collapsed) {
    return (
      <div className="flex flex-col gap-0.5">
        {section.databases?.map((db) => (
          <DatabaseItem spaceId={space!.id} key={db.id} db={db} collapsed />
        ))}
      </div>
    );
  }

  const dbIds = section.databases?.map((d) => d.id) ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(section.color ? { backgroundColor: section.color + "18", borderRadius: 6 } : {}),
      }}
      className={`flex flex-col gap-0.5 ${isDragging ? "opacity-0" : ""}`}
    >
      <div
        className={`group flex items-center rounded ${!section.color ? (showMenu ? "bg-surface" : "hover:bg-surface") : ""}`}
      >
        <button
          {...listeners}
          onClick={onToggle}
          className={`flex items-center gap-1 px-2 py-1 flex-1 min-w-0 touch-none ${isDragging ? "cursor-grabbing" : "cursor-pointer"}`}
        >
          <ChevronRight
            size={12}
            className={`text-ink-secondary shrink-0 transition-transform duration-150 ${isCollapsed ? "" : "rotate-90"}`}
          />
          {section.icon && (
            <span className="shrink-0 text-ink-secondary flex items-center">
              <IconDisplay value={section.icon} size={16} />
            </span>
          )}
          <span
            className="text-[11px] font-semibold uppercase tracking-wider truncate"
            style={{ color: section.color || undefined }}
          >
            {section.name}
          </span>
        </button>
        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          onClick={handleMenuToggle}
          className={`mr-1 shrink-0 transition-opacity ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <MoreHorizontal size={13} />
        </Button>
      </div>

      {showMenu && (
        <DropdownMenu
          anchorEl={menuButtonRef.current}
          onClose={() => setShowMenu(false)}
          items={[
            {
              label: t("addDatabase"),
              icon: <LayoutGrid size={13} />,
              onClick() {
                addDatabase.open();
              },
            },
            { label: t("edit"), icon: <Pencil size={13} />, onClick: openEdit },
            {
              label: t("delete"),
              icon: <Trash size={13} />,
              variant: "danger",
              onClick: () => {
                setShowDeleteConfirm(true);
                setShowMenu(false);
              },
            },
          ]}
        />
      )}

      {!isCollapsed && (
        <SortableContext items={dbIds} strategy={verticalListSortingStrategy}>
          {section.databases?.map((db) => (
            <DatabaseItem spaceId={space!.id} key={db.id} db={db} sectionId={section.id} sectionColor={section.color} />
          ))}
        </SortableContext>
      )}

      {showEditModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
            onClick={closeEdit}
          >
            <div
              className="w-105 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                  {t("editSection")}
                </span>
                <Button variant="ghost" size="icon" onClick={closeEdit}>
                  <X size={13} />
                </Button>
              </div>
              <div className="px-4 pb-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  <div>
                    <button
                      ref={iconButtonRef}
                      type="button"
                      onClick={() => {
                        setShowIconPicker((v) => !v);
                        setShowColorPicker(false);
                      }}
                      title={t("chooseIcon")}
                      className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent focus:outline-none focus:border-accent transition-colors"
                    >
                      {editIcon ? <IconDisplay value={editIcon} size={18} /> : <Smile size={15} />}
                    </button>
                    {showIconPicker && (
                      <IconPicker
                        value={editIcon}
                        onChange={(val) => {
                          setEditIcon(val);
                          setShowIconPicker(false);
                        }}
                        onClose={() => setShowIconPicker(false)}
                        anchorEl={iconButtonRef.current}
                      />
                    )}
                  </div>
                  <div>
                    <button
                      ref={colorButtonRef}
                      type="button"
                      onClick={() => {
                        setShowColorPicker((v) => !v);
                        setShowIconPicker(false);
                      }}
                      title={t("chooseColor")}
                      className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center hover:border-accent focus:outline-none focus:border-accent transition-colors overflow-hidden"
                    >
                      {editColor ? (
                        <span className="w-full h-full rounded-lg" style={{ backgroundColor: editColor }} />
                      ) : (
                        <span className="w-4 h-4 rounded-sm border-2 border-dashed border-ink-muted" />
                      )}
                    </button>
                    {showColorPicker && (
                      <ColorPicker
                        value={editColor}
                        onChange={setEditColor}
                        onClose={() => setShowColorPicker(false)}
                        anchorEl={colorButtonRef.current}
                      />
                    )}
                  </div>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                    placeholder={t("sectionName")}
                    className="flex-1 bg-surface border border-stroke rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
                  />
                </div>
                <Button
                  className="w-full"
                  loading={isSaving}
                  disabled={!editName.trim() || isSaving}
                  onClick={handleSaveEdit}
                >
                  {isSaving ? t("saving") : t("saveChanges")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title={t("deleteSection")}
          description={t("deleteSectionDesc")}
          confirmLabel={isDeleting ? t("deleting") : t("delete")}
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {addDatabase.isOpen && (
        <AddDatabaseModal
          spaceId={space!.id}
          sectionId={section.id}
          onClose={addDatabase.close}
          onSaved={addDatabase.close}
        />
      )}
    </div>
  );
}
