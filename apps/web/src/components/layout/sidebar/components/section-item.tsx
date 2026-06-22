"use client";

import { DatabaseItem } from "./database-item";
import { SectionEditModal } from "./section-edit-modal";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { DropdownMenu } from "@/components/ui/overlays/dropdown-menu";
import { DuplicationModal, type DuplicationOptions } from "@/components/ui/overlays/duplication-modal";
import { useAppContext } from "@/context/app-context";
import { useUIContext } from "@/context/ui-context";
import { useMutation } from "@tanstack/react-query";
import { duplicateSection, updateSpace } from "@/lib/api/space";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { ChevronRight, Copy, LayoutGrid, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { AddDatabaseModal } from "@/components/database/add-database-modal";
import { useModal } from "@/hooks/ui/use-modal";

interface SectionItemProps {
  section: SectionResponseDto;
  collapsed?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SectionItem({ section, collapsed, isExpanded, onToggle }: SectionItemProps) {
  const t = useTranslations("SectionItem");
  const { space, updateSpaceInList } = useAppContext();
  const { showToast } = useUIContext();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const editModal = useModal();
  const addDatabase = useModal();

  const { mutateAsync: duplicateSectionAction } = useMutation({
    mutationFn: (options: DuplicationOptions) => {
      if (!space) return Promise.reject();
      return duplicateSection(space.id, section.id, options);
    },
    onSuccess: (newSection) => {
      if (newSection && space) {
        updateSpaceInList({
          ...space,
          sections: [...(space.sections ?? []), newSection].sort((a, b) => a.position - b.position),
        });
        setShowDuplicateModal(false);
        showToast(t("sectionDuplicated"), "success");
      }
    },
  });

  const { mutate: deleteSection, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      if (!space) return;
      return updateSpace(space.id, {
        sectionOperations: [{ operation: "DELETE", id: section.id }],
      });
    },
    onSuccess: (updated) => {
      if (updated) {
        updateSpaceInList(updated);
        setShowDeleteConfirm(false);
      }
    },
  });

  function handleMenuToggle(event: React.MouseEvent) {
    event.stopPropagation();
    setShowMenu((prevShow) => !prevShow);
  }

  const databaseIds = section.databases?.map((database) => database.id) ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(section.color ? { backgroundColor: `color-mix(in srgb, ${section.color} 5%, transparent)` } : {}),
      }}
      className={`flex flex-col rounded-2xl -mx-1.5 ${isDragging ? "opacity-0" : ""}`}
    >
      <div
        className={`group flex items-center rounded-2xl transition-colors duration-150 ${collapsed ? "justify-center" : ""} ${showMenu ? "bg-surface" : "hover:bg-surface"}`}
      >
        <button
          type="button"
          {...listeners}
          onClick={onToggle}
          className={`flex items-center gap-1.5 px-2 py-1 h-7 flex-1 min-w-0 touch-none ${isDragging ? "cursor-grabbing" : "cursor-pointer"} ${collapsed ? "justify-center" : ""}`}
        >
          {!collapsed && (
            <span className="shrink-0 flex items-center">
              <ChevronRight
                size={12}
                className={`text-ink-muted ${isMounted ? "transition-transform duration-150" : ""} ${isExpanded ? "rotate-90" : ""}`}
              />
            </span>
          )}
          {section.icon && (
            <span className="shrink-0 text-ink-secondary flex items-center">
              <IconDisplay value={section.icon} size={14} />
            </span>
          )}
          {!collapsed && (
            <span className="type-nav-label truncate" style={{ color: section.color || undefined }}>
              {section.name}
            </span>
          )}
        </button>
        {!collapsed && (
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            title={t("options")}
            onClick={handleMenuToggle}
            className={`mr-1 shrink-0 transition-opacity duration-150 ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            <MoreHorizontal size={14} />
          </Button>
        )}
      </div>

      {showMenu && (
        <DropdownMenu
          anchorEl={menuButtonRef.current}
          onClose={() => setShowMenu(false)}
          items={[
            {
              label: t("addDatabase"),
              icon: <LayoutGrid size={14} />,
              onClick() {
                addDatabase.open();
              },
            },
            { label: t("edit"), icon: <Pencil size={14} />, onClick: editModal.open },
            {
              label: t("duplicate"),
              icon: <Copy size={14} />,
              onClick: () => {
                setShowDuplicateModal(true);
                setShowMenu(false);
              },
            },
            {
              label: t("delete"),
              icon: <Trash size={14} />,
              variant: "danger",
              onClick: () => {
                setShowDeleteConfirm(true);
                setShowMenu(false);
              },
            },
          ]}
        />
      )}

      {isExpanded && <div className="border-t border-stroke" />}

      {isExpanded && space && (
        <div className={`py-0.5 ${collapsed ? "ml-0" : "ml-3"}`}>
          <SortableContext items={databaseIds} strategy={verticalListSortingStrategy}>
            {section.databases?.map((database) => (
              <DatabaseItem
                spaceId={space.id}
                key={database.id}
                database={database}
                sectionId={section.id}
                sectionColor={section.color}
                collapsed={collapsed}
              />
            ))}
          </SortableContext>
        </div>
      )}

      {editModal.isOpen && <SectionEditModal section={section} onClose={editModal.close} />}

      {showDeleteConfirm && (
        <ConfirmDialog
          title={t("deleteSection")}
          description={t("deleteSectionDesc")}
          confirmLabel={isDeleting ? t("deleting") : t("delete")}
          variant="danger"
          onConfirm={() => deleteSection()}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showDuplicateModal && (
        <DuplicationModal
          target="section"
          initialName={`${section.name} (Copy)`}
          onConfirm={async (options) => {
            await duplicateSectionAction(options);
          }}
          onCancel={() => setShowDuplicateModal(false)}
        />
      )}

      {space && addDatabase.isOpen && (
        <AddDatabaseModal spaceId={space.id} sectionId={section.id} onClose={addDatabase.close} onSaved={addDatabase.close} />
      )}
    </div>
  );
}
