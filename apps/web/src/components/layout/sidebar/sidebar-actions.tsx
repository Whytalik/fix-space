"use client";

import { AddSectionModal } from "./components/add-section-modal";
import { AddDatabaseModal } from "@/components/database/add-database-modal";
import { useAppContext } from "@/context/app-context";
import { useModal } from "@/hooks/ui/use-modal";
import { FolderPlus, LayoutGrid } from "lucide-react";

export function SidebarActions() {
  const { space } = useAppContext();
  const addSection = useModal();
  const addDatabase = useModal();

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={addSection.open}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink-secondary hover:bg-surface hover:text-ink transition-colors duration-150 w-full"
      >
        <FolderPlus size={14} className="shrink-0" />
        <span>Add section</span>
      </button>
      <button
        type="button"
        onClick={addDatabase.open}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink-secondary hover:bg-surface hover:text-ink transition-colors duration-150 w-full"
      >
        <LayoutGrid size={14} className="shrink-0" />
        <span>Add database</span>
      </button>

      {addSection.isOpen && <AddSectionModal onClose={addSection.close} />}
      {space && addDatabase.isOpen && <AddDatabaseModal spaceId={space.id} onClose={addDatabase.close} onSaved={addDatabase.close} />}
    </div>
  );
}
