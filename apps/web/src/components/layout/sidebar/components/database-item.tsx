"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { DropdownMenu } from "@/components/ui/overlays/dropdown-menu";
import { useAppContext } from "@/context/app-context";
import { useMutation } from "@tanstack/react-query";
import { deleteDatabase as deleteDatabaseApi, duplicateDatabase } from "@/lib/api/database";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DatabaseResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { Copy, Lock, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface DatabaseItemProps {
  spaceId: string;
  database: DatabaseResponseDto;
  collapsed?: boolean;
  sectionId?: string | null;
  sectionColor?: string | null;
}

export function DatabaseItem({ spaceId, database, collapsed, sectionId, sectionColor }: DatabaseItemProps) {
  const t = useTranslations("DatabaseItem");
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname.startsWith(`/database/${database.id}`);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { removeDatabaseFromSpace, addDatabaseToSpace } = useAppContext();

  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({
    id: database.id,
    data: { type: "database", sectionId: sectionId ?? null },
    disabled: !!collapsed,
  });

  const style = {
    transform: transform ? CSS.Transform.toString({ ...transform, x: 0 }) : undefined,
    transition,
  };

  async function handleDatabaseDuplicate(): Promise<void> {
    const duplicated = await duplicateDatabase(spaceId, database.id);
    addDatabaseToSpace(duplicated);
  }

  const { mutate: deleteDatabase, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteDatabaseApi(spaceId, database.id),
    onSuccess: () => {
      removeDatabaseFromSpace(database.id);
      setShowDeleteConfirm(false);
      if (isActive) router.push("/");
    },
  });

  function handleMenuToggle(event: React.MouseEvent) {
    event.stopPropagation();
    setShowMenu((prev) => !prev);
  }

  return (
    <div ref={setNodeRef} style={style} className={`${isDragging ? "opacity-0" : ""}`}>
      <div
        className={`group flex items-center rounded-lg transition-colors duration-150 ${
          isActive
            ? sectionColor
              ? "text-ink"
              : "bg-surface text-ink"
            : showMenu
              ? sectionColor
                ? ""
                : "bg-surface"
              : sectionColor
                ? ""
                : "hover:bg-surface"
        } ${isDragging ? "pointer-events-none" : ""}`}
        style={
          isActive && sectionColor
            ? { backgroundColor: `color-mix(in srgb, ${sectionColor} 35%, transparent)` }
            : !isActive && sectionColor && (isHovered || showMenu)
              ? { backgroundColor: `color-mix(in srgb, ${sectionColor} 15%, transparent)` }
              : undefined
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/database/${database.id}`}
          title={collapsed ? database.title || database.name : undefined}
          draggable={false}
          {...listeners}
          className={`flex items-center gap-2 py-1 flex-1 min-w-0 touch-none ${collapsed ? "justify-center px-2" : sectionId ? "pl-3 pr-2" : "px-2"}`}
        >
          <span className="shrink-0 flex items-center">
            <IconDisplay value={database.icon || "📄"} size={14} />
          </span>
          {!collapsed && (
            <>
              <span className={`text-sm truncate min-w-0 ${isActive ? "text-ink" : "text-ink-secondary"}`}>
                {database.title || database.name}
              </span>
              {database.isPreset && <Lock size={11} className="shrink-0 text-ink-muted" />}
            </>
          )}
        </Link>

        {!collapsed &&
          (database.isPreset ? null : (
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="icon"
              onClick={handleMenuToggle}
              className={`mr-1 shrink-0 transition-opacity duration-150 ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              <MoreHorizontal size={14} />
            </Button>
          ))}
      </div>

      {!database.isPreset && showMenu && (
        <DropdownMenu
          anchorEl={menuButtonRef.current}
          onClose={() => setShowMenu(false)}
          items={[
            { label: t("edit"), icon: <Pencil size={14} />, onClick: () => router.push(`/database/${database.id}/edit`) },
            { label: t("duplicate"), icon: <Copy size={14} />, onClick: handleDatabaseDuplicate },
            {
              label: t("delete"),
              icon: <Trash size={14} />,
              variant: "danger",
              onClick: () => setShowDeleteConfirm(true),
            },
          ]}
        />
      )}
      {!database.isPreset && showDeleteConfirm && (
        <ConfirmDialog
          title={t("deleteDatabase")}
          description={t("deleteDatabaseDesc")}
          confirmLabel={isDeleting ? t("deleting") : t("delete")}
          variant="danger"
          onConfirm={() => deleteDatabase()}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
