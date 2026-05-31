"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { DropdownMenu } from "@/components/ui/overlays/dropdown-menu";
import { useAppContext } from "@/context/app-context";
import { useMutation } from "@/hooks/useMutation";
import { deleteDatabase as deleteDatabaseApi, duplicateDatabase } from "@/lib/api/database";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DatabaseResponseDto } from "@fixspace/domain";
import { Button } from "@/components/ui/primitives/actions/button";
import { Copy, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface DatabaseItemProps {
  spaceId: string;
  db: DatabaseResponseDto;
  collapsed?: boolean;
  sectionId?: string | null;
  sectionColor?: string | null;
}

export function DatabaseItem({ spaceId, db, collapsed, sectionId, sectionColor }: DatabaseItemProps) {
  const t = useTranslations("DatabaseItem");
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname.startsWith(`/database/${db.id}`);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { removeDatabaseFromSpace, addDatabaseToSpace } = useAppContext();

  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({
    id: db.id,
    data: { type: "database", sectionId: sectionId ?? null },
    disabled: !!collapsed,
  });

  const style = {
    transform: transform ? CSS.Transform.toString({ ...transform, x: 0 }) : undefined,
    transition,
  };

  async function handleDatabaseDuplicate(): Promise<void> {
    const duplicated = await duplicateDatabase(spaceId, db.id);
    addDatabaseToSpace(duplicated);
  }

  const { mutate: deleteDatabase, isLoading: isDeleting } = useMutation(async () => {
    await deleteDatabaseApi(spaceId, db.id);
    removeDatabaseFromSpace(db.id);
    if (isActive) router.push("/");
  });

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setShowMenu((v) => !v);
  }

  async function handleConfirmDelete() {
    const ok = await deleteDatabase();
    if (ok) setShowDeleteConfirm(false);
  }

  function handleDatabaseDelete(): void {
    setShowDeleteConfirm(true);
  }

  function handleDatabaseEdit(): void {
    router.push(`/database/${db.id}/edit`);
  }

  return (
    <div ref={setNodeRef} style={style} className={`${isDragging ? "opacity-0" : ""}`}>
      <div
        className={`group flex items-center rounded-md transition-colors ${
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
          href={`/database/${db.id}`}
          title={collapsed ? db.title || db.name : undefined}
          draggable={false}
          {...listeners}
          className={`flex items-center gap-2 py-1 flex-1 min-w-0 touch-none ${collapsed ? "justify-center px-2" : sectionId ? "pl-5 pr-2" : "px-2"}`}
        >
          <span className="shrink-0 flex items-center">
            <IconDisplay value={db.icon || "📄"} size={14} />
          </span>
          {!collapsed && (
            <span className={`text-[13px] truncate ${isActive ? "text-ink" : "text-ink-secondary"}`}>
              {db.title || db.name}
            </span>
          )}
        </Link>

        {!collapsed && (
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            onClick={handleMenuToggle}
            className={`mr-1 shrink-0 transition-opacity ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            <MoreHorizontal size={13} />
          </Button>
        )}
      </div>

      {showMenu && (
        <DropdownMenu
          anchorEl={menuButtonRef.current}
          onClose={() => setShowMenu(false)}
          items={[
            { label: t("edit"), icon: <Pencil size={13} />, onClick: handleDatabaseEdit },
            { label: t("duplicate"), icon: <Copy size={13} />, onClick: handleDatabaseDuplicate },
            {
              label: t("delete"),
              icon: <Trash size={13} />,
              variant: "danger",
              onClick: handleDatabaseDelete,
            },
          ]}
        />
      )}
      {showDeleteConfirm && (
        <ConfirmDialog
          title={t("deleteDatabase")}
          description={t("deleteDatabaseDesc")}
          confirmLabel={isDeleting ? t("deleting") : t("delete")}
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
