"use client";

import { DatabaseItem } from "./database-item";
import { SectionEditModal } from "./section-edit-modal";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { DropdownMenu } from "@/components/ui/overlays/dropdown-menu";
import { useAppContext } from "@/context/app-context";
import { useMutation } from "@tanstack/react-query";
import { updateSpace } from "@/lib/api/space";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { ChevronRight, LayoutGrid, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { AddDatabaseModal } from "@/features/database/add-database-modal";
import { useModal } from "@/hooks/useModal";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const editModal = useModal();
  const addDatabase = useModal();

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

  if (collapsed) {
    return (
      <div className="flex flex-col gap-0.5">
        {space && section.databases?.map((database) => <DatabaseItem spaceId={space.id} key={database.id} database={database} collapsed />)}
      </div>
    );
  }

  const databaseIds = section.databases?.map((database) => database.id) ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(section.color ? { backgroundColor: `color-mix(in srgb, ${section.color} 5%, transparent)` } : {}),
      }}
      className={`flex flex-col rounded-lg ${isDragging ? "opacity-0" : ""}`}
    >
      <div className={`group flex items-center rounded-lg ${showMenu ? "bg-surface" : "hover:bg-surface"}`}>
        <button
          type="button"
          {...listeners}
          onClick={onToggle}
          className={`flex items-center gap-1.5 px-2 py-1 flex-1 min-w-0 touch-none ${isDragging ? "cursor-grabbing" : "cursor-pointer"}`}
        >
          <ChevronRight
            size={12}
            className={`text-ink-muted shrink-0 transition-transform duration-150 ${isCollapsed ? "" : "rotate-90"}`}
          />
          {section.icon && (
            <span className="shrink-0 text-ink-secondary flex items-center">
              <IconDisplay value={section.icon} size={14} />
            </span>
          )}
          <span className="type-nav-label truncate" style={{ color: section.color || undefined }}>
            {section.name}
          </span>
        </button>
        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          onClick={handleMenuToggle}
          className={`mr-1 shrink-0 transition-opacity duration-150 ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <MoreHorizontal size={14} />
        </Button>
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

      {!isCollapsed && space && (
        <div
          className={`ml-5 border-l py-0.5 ${section.color ? "" : "border-stroke"}`}
          style={section.color ? { borderColor: `color-mix(in srgb, ${section.color} 50%, transparent)` } : undefined}
        >
          <SortableContext items={databaseIds} strategy={verticalListSortingStrategy}>
            {section.databases?.map((database) => (
              <DatabaseItem spaceId={space.id} key={database.id} database={database} sectionId={section.id} sectionColor={section.color} />
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

      {space && addDatabase.isOpen && (
        <AddDatabaseModal spaceId={space.id} sectionId={section.id} onClose={addDatabase.close} onSaved={addDatabase.close} />
      )}
    </div>
  );
}
