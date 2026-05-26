"use client";

import { DatabaseProvider } from "@/context/database-context";
import { getRecord } from "@/lib/api/record";
import { useAppContext } from "@/context/app-context";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecordLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const { isLoading: appLoading, setCurrentRecordName, setCurrentRecordIcon } = useAppContext();
  const [databaseId, setDatabaseId] = useState<string | null>(null);

  useEffect(() => {
    if (appLoading) return;
    getRecord(id)
      .then((r) => {
        setDatabaseId(r.databaseId);
        setCurrentRecordName(r.name || null);
        setCurrentRecordIcon(r.icon || null);
      })
      .catch(() => setDatabaseId(null));
    return () => {
      setCurrentRecordName(null);
      setCurrentRecordIcon(null);
      setDatabaseId(null);
    };
  }, [id, appLoading, setCurrentRecordName, setCurrentRecordIcon]);

  if (!databaseId) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="w-5 h-5 rounded-full border-2 border-stroke border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <DatabaseProvider databaseId={databaseId}>
      <div className="flex flex-col h-full min-h-0 bg-canvas overflow-hidden">
        <main className="flex-1 overflow-hidden relative">{children}</main>
      </div>
    </DatabaseProvider>
  );
}
