"use client";

import { ApiError } from "@/lib/api/client";
import { getProperties } from "@/lib/api/property";
import { getRecords } from "@/lib/api/record";
import { getCached, setCached } from "@/lib/cache";
import type { DatabaseResponseDto, PropertyResponseDto, RecordResponseDto } from "@nucleus/domain";
import { PropertyType } from "@nucleus/domain";
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
  relatedRecordsMap: Record<string, RecordResponseDto[]>;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  applyDatabaseUpdate: (updated: DatabaseResponseDto) => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  properties: [],
  records: [],
  relatedRecordsMap: {},
  isLoading: false,
  error: null,
  refresh: () => {},
  applyDatabaseUpdate: () => {},
});

async function fetchRelatedRecords(props: PropertyResponseDto[]): Promise<Record<string, RecordResponseDto[]>> {
  const ids = [
    ...new Set(
      props
        .filter((p) => p.type === PropertyType.RELATION)
        .map((p) => (p.config as { relatedEntityId?: string } | null)?.relatedEntityId)
        .filter(Boolean) as string[],
    ),
  ];
  if (ids.length === 0) return {};
  const entries = await Promise.all(ids.map((id) => getRecords(id).then((recs) => [id, recs] as const)));
  return Object.fromEntries(entries);
}

export function DatabaseProvider({ children, databaseId: propId }: { children: React.ReactNode; databaseId?: string }) {
  const params = useParams<{ id?: string }>();
  const id = propId ?? params.id ?? "";
  const { databases, isLoading: appLoading, clearSession, setCurrentDatabaseId } = useAppContext();

  const spaceDatabase = databases.find((d) => d.id === id) ?? null;

  const [databaseOverride, setDatabaseOverride] = useState<DatabaseResponseDto | null>(null);
  const database = databaseOverride ?? spaceDatabase;

  const [properties, setProperties] = useState<PropertyResponseDto[]>([]);
  const [records, setRecords] = useState<RecordResponseDto[]>([]);
  const [relatedRecordsMap, setRelatedRecordsMap] = useState<Record<string, RecordResponseDto[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) setCurrentDatabaseId(id);
  }, [id, setCurrentDatabaseId]);

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
        return fetchRelatedRecords(props);
      })
      .then((map) => setRelatedRecordsMap(map))
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
      fetchRelatedRecords(cachedProps).then(setRelatedRecordsMap);
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
        relatedRecordsMap,
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
