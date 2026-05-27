"use client";

import { useAppContext } from "@/context/app-context";
import type { DatabaseResponseDto } from "@fixspace/domain";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export function useCurrentDatabase(): {
  database: DatabaseResponseDto | null;
  isDatabasePage: boolean;
  isRecordPage: boolean;
} {
  const pathname = usePathname();
  const { databases, currentDatabaseId } = useAppContext();
  const lastDatabaseRef = useRef<DatabaseResponseDto | null>(null);

  const isRecordPage = pathname.startsWith("/record/");
  const isDatabasePage = pathname.startsWith("/database/");

  const database = databases.find((d) => d.id === currentDatabaseId) ?? null;
  if (database) lastDatabaseRef.current = database;

  const displayDatabase = database ?? lastDatabaseRef.current;

  return { database: displayDatabase, isDatabasePage, isRecordPage };
}
