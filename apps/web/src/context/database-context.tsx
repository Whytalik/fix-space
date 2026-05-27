"use client";

import { ApiError } from "@/lib/api/client";
import { getProperties } from "@/lib/api/property";
import { getRecords } from "@/lib/api/record";
import { clearCached, getCached, setCached } from "@/lib/cache";
import {
  loadFilterLogic,
  loadFilters,
  loadSorts,
  loadWrapCells,
  saveFilterLogic,
  saveFilters,
  saveSorts,
  saveWrapCells,
} from "@/lib/utils/db-view-storage";
import type {
  DatabaseResponseDto,
  PropertyResponseDto,
  RecordFilterDto,
  RecordGroupDto,
  RecordResponseDto,
  RecordSortDto,
} from "@fixspace/domain";
import { FilterLogic, PropertyType } from "@fixspace/domain/enums";

export interface GroupEntry {
  key: string;
  label: string;
  records: RecordResponseDto[];
}

import { useParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAppContext } from "./app-context";

const PROPS_TTL = 5 * 60 * 1000;
const RECS_TTL = 60 * 1000;
const DEFAULT_PAGE_SIZE = 25;

const propsKey = (id: string) => `db-props:${id}`;
const recsKey = (id: string) => `db-recs:${id}`;

interface DatabaseContextValue {
  database: DatabaseResponseDto | null;
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
  relatedRecordsMap: Record<string, RecordResponseDto[]>;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sorts: RecordSortDto[];
  filters: RecordFilterDto[];
  filterLogic: FilterLogic;
  group: RecordGroupDto | null;
  groupedRecords: GroupEntry[] | null;
  groupColors: Record<string, string>;
  hiddenGroups: Set<string>;
  wrapCells: boolean;
  refresh: () => void;
  invalidateRecords: () => void;
  applyDatabaseUpdate: (updated: DatabaseResponseDto) => void;
  applyPropertiesUpdate: (updated: PropertyResponseDto[]) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (value: string) => void;
  setSorts: (sorts: RecordSortDto[]) => void;
  setFilters: (filters: RecordFilterDto[]) => void;
  setFilterLogic: (logic: FilterLogic) => void;
  setGroup: (group: RecordGroupDto | null) => void;
  setGroupColor: (key: string, color: string) => void;
  toggleHiddenGroup: (key: string) => void;
  setWrapCells: (wrap: boolean) => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  properties: [],
  records: [],
  relatedRecordsMap: {},
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  search: "",
  sorts: [],
  filters: [],
  filterLogic: FilterLogic.AND,
  group: null,
  groupedRecords: null,
  groupColors: {},
  hiddenGroups: new Set(),
  wrapCells: false,
  refresh: () => {},
  invalidateRecords: () => {},
  applyDatabaseUpdate: () => {},
  applyPropertiesUpdate: () => {},
  setPage: () => {},
  setPageSize: () => {},
  setSearch: () => {},
  setSorts: () => {},
  setFilters: () => {},
  setFilterLogic: () => {},
  setGroup: () => {},
  setGroupColor: () => {},
  toggleHiddenGroup: () => {},
  setWrapCells: () => {},
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
  const [allRecords, setAllRecords] = useState<RecordResponseDto[]>([]);
  const [relatedRecordsMap, setRelatedRecordsMap] = useState<Record<string, RecordResponseDto[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sorts, setSortsState] = useState<RecordSortDto[]>([]);
  const [filters, setFiltersState] = useState<RecordFilterDto[]>([]);
  const [filterLogic, setFilterLogicState] = useState<FilterLogic>(FilterLogic.AND);
  const [group, setGroup] = useState<RecordGroupDto | null>(null);
  const [groupColors, setGroupColorsState] = useState<Record<string, string>>({});
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());
  const [wrapCells, setWrapCellsState] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (id) setCurrentDatabaseId(id);
  }, [id, setCurrentDatabaseId]);

  useEffect(() => {
    if (!id) return;
    setSortsState(loadSorts(id));
    setFiltersState(loadFilters(id));
    setFilterLogicState(loadFilterLogic(id));
    setWrapCellsState(loadWrapCells(id));
    setPage(1);
    setSearch("");
    setGroup(null);
  }, [id]);

  const setSorts = useCallback(
    (value: RecordSortDto[]) => {
      setSortsState(value);
      saveSorts(id, value);
      setPage(1);
    },
    [id],
  );

  const setFilters = useCallback(
    (value: RecordFilterDto[]) => {
      setFiltersState(value);
      saveFilters(id, value);
      setPage(1);
    },
    [id],
  );

  const setFilterLogic = useCallback(
    (value: FilterLogic) => {
      setFilterLogicState(value);
      saveFilterLogic(id, value);
    },
    [id],
  );

  const setWrapCells = useCallback(
    (value: boolean) => {
      setWrapCellsState(value);
      saveWrapCells(id, value);
    },
    [id],
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const handleSetSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const setGroupColor = useCallback((key: string, color: string) => {
    setGroupColorsState((prev) => ({ ...prev, [key]: color }));
  }, []);

  const toggleHiddenGroup = useCallback((key: string) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const filteredRecords = useMemo(() => {
    if (!search) return allRecords;
    const lower = search.toLowerCase();
    return allRecords.filter((r) => r.name?.toLowerCase().includes(lower));
  }, [allRecords, search]);

  const total = filteredRecords.length;

  const records = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const groupedRecords = useMemo<GroupEntry[] | null>(() => {
    if (!group) return null;
    const groups = new Map<string, GroupEntry>();
    for (const record of filteredRecords) {
      const key = record.id;
      const label = record.name ?? "";
      if (!groups.has(key)) groups.set(key, { key, label, records: [] });
      groups.get(key)!.records.push(record);
    }
    return groups.size > 0 ? Array.from(groups.values()) : null;
  }, [filteredRecords, group]);

  const invalidateRecords = useCallback(() => {
    clearCached(recsKey(id));
  }, [id]);

  const refresh = useCallback(() => {
    if (appLoading || !id) return;

    setIsLoading(true);
    setError(null);

    Promise.all([getProperties(id), getRecords(id)])
      .then(([props, recs]) => {
        setProperties(props);
        setAllRecords(recs);
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
    setAllRecords([]);
    setIsLoading(true);
    setError(null);

    if (appLoading || !id) return;

    const cachedProps = getCached<PropertyResponseDto[]>(propsKey(id));
    const cachedRecs = getCached<RecordResponseDto[]>(recsKey(id));

    if (cachedProps && cachedRecs) {
      setProperties(cachedProps);
      setAllRecords(cachedRecs);
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
        total,
        page,
        pageSize,
        search,
        sorts,
        filters,
        filterLogic,
        group,
        groupedRecords,
        groupColors,
        hiddenGroups,
        wrapCells,
        refresh,
        invalidateRecords,
        applyDatabaseUpdate: setDatabaseOverride,
        applyPropertiesUpdate: setProperties,
        setPage,
        setPageSize,
        setSearch: handleSetSearch,
        setSorts,
        setFilters,
        setFilterLogic,
        setGroup,
        setGroupColor,
        toggleHiddenGroup,
        setWrapCells,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  return useContext(DatabaseContext);
}
