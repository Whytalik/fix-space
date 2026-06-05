"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { Badge } from "@/components/ui/primitives/display/badge";
import { useAppContext } from "@/context/app-context";
import type { DatabaseResponseDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export function HeaderDatabase() {
  const t = useTranslations("DatabaseHeader");
  const pathname = usePathname();
  const { databases, currentDatabaseId } = useAppContext();
  const lastDatabaseRef = useRef<DatabaseResponseDto | null>(null);

  const isDatabasePage = pathname.startsWith("/database/");

  const database = databases.find((databaseItem) => databaseItem.id === currentDatabaseId) ?? null;
  if (database) lastDatabaseRef.current = database;

  if (!isDatabasePage) return null;
  const displayDatabase = database ?? lastDatabaseRef.current;
  if (!displayDatabase) return null;

  return (
    <>
      <span className="text-stroke mx-1">|</span>
      <Link
        href={`/database/${displayDatabase.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
      >
        <span className="inline-flex items-center">
          <IconDisplay value={displayDatabase.icon || "📄"} size={13} />
        </span>
        {displayDatabase.title || displayDatabase.name}
        {displayDatabase.isPreset && (
          <Badge variant="accent" className="text-xs px-1.5 py-0 leading-4">
            {t("preset")}
          </Badge>
        )}
      </Link>
    </>
  );
}
