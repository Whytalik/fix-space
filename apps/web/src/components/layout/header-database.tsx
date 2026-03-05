"use client";

import { IconDisplay } from "@/components/ui/icon-picker";
import { useDatabaseContext } from "@/context/database-context";
import { usePathname } from "next/navigation";

export function HeaderDatabase() {
  const pathname = usePathname();
  const { database } = useDatabaseContext();

  if (!pathname.startsWith("/database/") || !database) return null;

  return (
    <>
      <span className="text-stroke mx-1">|</span>
      <span className="text-sm font-semibold text-ink-secondary">
        <span className="mr-1 inline-flex items-center">
          <IconDisplay value={database.icon || "📄"} size={13} />
        </span>
        {database.title || database.name}
      </span>
    </>
  );
}
