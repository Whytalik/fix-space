"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Button } from "@/components/ui/primitives/button";
import { useDatabaseContext } from "@/context/database-context";
import { useUIContext } from "@/context/ui-context";
import { clearCached } from "@/lib/cache";
import { createRecord } from "@/lib/api/record";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DatabaseHeader() {
  const router = useRouter();
  const { database } = useDatabaseContext();
  const { showError } = useUIContext();
  const [isCreating, setIsCreating] = useState(false);

  if (!database) return null;

  function handleEdit() {
    router.push(`/database/${database!.id}/edit`);
  }

  async function handleAddItem() {
    try {
      setIsCreating(true);
      const record = await createRecord(database!.id, {});
      clearCached(`db-recs:${database!.id}`);
      router.push(`/record/${record.id}?edit=true`);
    } catch (err) {
      showError(err);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <IconDisplay value={database.icon || "📄"} size={36} />
        <h1 className="type-page-title">{database.title || database.name}</h1>
      </div>

      <div className="flex items-center gap-2 pt-1 shrink-0">
        <Button variant="secondary" size="sm" onClick={handleEdit} className="flex items-center gap-1.5">
          <Pencil size={13} />
          Edit
        </Button>
        <Button size="sm" onClick={handleAddItem} loading={isCreating} disabled={isCreating} className="flex items-center gap-1.5">
          <Plus size={13} />
          Add Item
        </Button>
      </div>
    </div>
  );
}
