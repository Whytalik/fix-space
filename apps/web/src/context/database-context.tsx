"use client";

import { ApiError } from "@/lib/api/client";
import { getProperties, getRecords } from "@/lib/api/database";
import { getCached, setCached } from "@/lib/cache";
import type { DatabaseResponseDto, PropertyResponseDto, RecordResponseDto } from "@nucleus/domain";
import { useParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAppContext } from "./app-context";

const PROPS_TTL = 5 * 60 * 1000;
const RECS_TTL = 60 * 1000;

const propsKey = (id: string) => `db-props:${id}`;
const recsKey = (id: string) => `db-recs:${id}`;

interface DatabaseContextValue {
  database: DatabaseResponseDto | null;
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  applyDatabaseUpdate: (updated: DatabaseResponseDto) => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  properties: [],
  records: [],
  isLoading: false,
  error: null,
  refresh: () => {},
  applyDatabaseUpdate: () => {},
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const { space, isLoading: appLoading, clearSession } = useAppContext();

  const allDatabases = [
    ...(space?.databases ?? []),
    ...(space?.sections ?? []).flatMap((s) => s.databases ?? []),
  ];
  const spaceDatabase = allDatabases.find((d) => d.id === id) ?? null;

  const [databaseOverride, setDatabaseOverride] = useState<DatabaseResponseDto | null>(null);
  const database = databaseOverride ?? spaceDatabase;

  const [properties, setProperties] = useState<PropertyResponseDto[]>([]);
  const [records, setRecords] = useState<RecordResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (appLoading || !id) return;

    setIsLoading(true);
    setError(null);

    Promise.all([getProperties(id), getRecords(id)])
      .then(([props, recs]) => {
        setProperties(props);
        setRecords(recs);
        setCached(propsKey(id), props, PROPS_TTL);
        setCached(recsKey(id), recs, RECS_TTL);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            clearSession();
            return;
          }
          setError(err.messages[0] ?? "Failed to load database content.");
        } else {
          setError("Failed to load database content.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, appLoading, clearSession]);

  useEffect(() => {
    setDatabaseOverride(null);
    setProperties([]);
    setRecords([]);
    setIsLoading(true);
    setError(null);

    if (appLoading || !id) return;

    const cachedProps = getCached<PropertyResponseDto[]>(propsKey(id));
    const cachedRecs = getCached<RecordResponseDto[]>(recsKey(id));

    if (cachedProps && cachedRecs) {
      setProperties(cachedProps);
      setRecords(cachedRecs);
      setIsLoading(false);
      return;
    }

    refresh();
  }, [id, appLoading, refresh]);


  return (
    <DatabaseContext.Provider
      value={{
        database,
        properties,
        records,
        isLoading,
        error,
        refresh,
        applyDatabaseUpdate: setDatabaseOverride,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  return useContext(DatabaseContext);
}
