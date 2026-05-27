"use client";

import { ApiError } from "@/lib/api/client";
import { getProperties } from "@/lib/api/property";
import { getRecords } from "@/lib/api/record";
import { getCached, setCached } from "@/lib/cache";
import type {
  DatabaseResponseDto,
  PropertyResponseDto,
  RecordFilterDto,
  RecordResponseDto,
  RecordSortDto,
} from "@fixspace/domain";
import { FilterLogic, PropertyType } from "@fixspace/domain/enums";
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
  page: number;
  pageSize: number;
  total: number;
  wrapCells: boolean;
  search: string;
  sorts: RecordSortDto[];
  filters: RecordFilterDto[];
  filterLogic: FilterLogic;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setWrapCells: (wrap: boolean) => void;
  setSearch: (value: string) => void;
  setSorts: (sorts: RecordSortDto[]) => void;
  setFilters: (filters: RecordFilterDto[]) => void;
  setFilterLogic: (logic: FilterLogic) => void;
  refresh: () => void;
  invalidateRecords: () => void;
  applyDatabaseUpdate: (updated: DatabaseResponseDto) => void;
  applyPropertiesUpdate: (properties: PropertyResponseDto[]) => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  properties: [],
  records: [],
  relatedRecordsMap: {},
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 25,
  total: 0,
  wrapCells: false,
  search: "",
  sorts: [],
  filters: [],
  filterLogic: FilterLogic.AND,
  setPage: () => {},
  setPageSize: () => {},
  setWrapCells: () => {},
  setSearch: () => {},
  setSorts: () => {},
  setFilters: () => {},
  setFilterLogic: () => {},
  refresh: () => {},
  invalidateRecords: () => {},
  applyDatabaseUpdate: () => {},
  applyPropertiesUpdate: () => {},
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [wrapCells, setWrapCells] = useState(false);
  const [search, setSearch] = useState("");
  const [sorts, setSorts] = useState<RecordSortDto[]>([]);
  const [filters, setFilters] = useState<RecordFilterDto[]>([]);
  const [filterLogic, setFilterLogic] = useState<FilterLogic>(FilterLogic.AND);

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

  const invalidateRecords = useCallback(() => {
    if (id) setCached(recsKey(id), null, 0);
  }, [id]);

  return (
    <DatabaseContext.Provider
      value={{
        database,
        properties,
        records,
        relatedRecordsMap,
        isLoading,
        error,
        page,
        pageSize,
        total: records.length,
        wrapCells,
        search,
        sorts,
        filters,
        filterLogic,
        setPage,
        setPageSize,
        setWrapCells,
        setSearch,
        setSorts,
        setFilters,
        setFilterLogic,
        refresh,
        invalidateRecords,
        applyDatabaseUpdate: setDatabaseOverride,
        applyPropertiesUpdate: setProperties,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  return useContext(DatabaseContext);
}
