"use client";

import { useAppContext } from "@/context/app-context";
import { DatabaseProvider } from "@/context/database-context";
import { getRecord } from "@/lib/api/record";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecordLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const { isLoading: appLoading, setCurrentRecordName } = useAppContext();
  const [databaseId, setDatabaseId] = useState<string | null>(null);

  useEffect(() => {
    if (appLoading) return;
    getRecord(id)
      .then((r) => {
        setDatabaseId(r.databaseId);
        setCurrentRecordName(r.name || null);
      })
      .catch(() => setDatabaseId(null));
    return () => setCurrentRecordName(null);
  }, [id, appLoading, setCurrentRecordName]);

  if (!databaseId) {
    return <div className="flex items-center justify-center h-screen" />;
  }

  return <DatabaseProvider databaseId={databaseId}>{children}</DatabaseProvider>;
}
