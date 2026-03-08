"use client";

import { IconDisplay } from "@/components/ui/icons/icon-display";
import { useAppContext } from "@/context/app-context";
import type { DatabaseResponseDto } from "@nucleus/domain";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export function HeaderDatabase() {
  const pathname = usePathname();
  const { databases, currentDatabaseId, currentRecordName } = useAppContext();
  const lastDatabaseRef = useRef<DatabaseResponseDto | null>(null);

  const isRecordPage = pathname.startsWith("/record/");
  const isDatabasePage = pathname.startsWith("/database/");

  const database = databases.find((d) => d.id === currentDatabaseId) ?? null;
  if (database) lastDatabaseRef.current = database;

  if (!isDatabasePage && !isRecordPage) return null;
  const displayDatabase = database ?? lastDatabaseRef.current;
  if (!displayDatabase) return null;

  return (
    <>
      <span className="text-stroke mx-1">|</span>
      {isRecordPage ? (
        <>
          <Link
            href={`/database/${displayDatabase.id}`}
            className="text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
          >
            <span className="mr-1 inline-flex items-center">
              <IconDisplay value={displayDatabase.icon || "📄"} size={13} />
            </span>
            {displayDatabase.title || displayDatabase.name}
          </Link>
          {currentRecordName && (
            <>
              <span className="text-stroke mx-1">|</span>
              <span className="text-sm font-semibold text-ink">{currentRecordName}</span>
            </>
          )}
        </>
      ) : (
        <Link
          href={`/database/${displayDatabase.id}`}
          className="text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
        >
          <span className="mr-1 inline-flex items-center">
            <IconDisplay value={displayDatabase.icon || "📄"} size={13} />
          </span>
          {displayDatabase.title || displayDatabase.name}
        </Link>
      )}
    </>
  );
}
