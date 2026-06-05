"use client";

import { usePropertiesQuery } from "@/hooks/usePropertiesQuery";
import { useRecordsQuery } from "@/hooks/useRecordsQuery";
import { queryKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { getRecords } from "@/lib/api/record";
import { parseApiError } from "@/lib/api/client";
import {
  loadFilterLogic,
  loadFilters,
  loadSorts,
  loadWrapCells,
  saveFilterLogic,
  saveFilters,
  saveSorts,
  saveWrapCells,
} from "@/utils/db-view-storage";
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

const DEFAULT_PAGE_SIZE = 25;

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
  const { databases, isLoading: appLoading, updateDatabaseInSpace, setCurrentDatabaseId } = useAppContext();

  const queryClient = useQueryClient();

  const database = useMemo(() => databases.find((d) => d.id === id) ?? null, [databases, id]);

  const { data: properties = [], isLoading: isPropsLoading, error: propsError } = usePropertiesQuery(id, { enabled: !appLoading && !!id });

  const { data: allRecords = [], isLoading: isRecsLoading, error: recsError } = useRecordsQuery(id, { enabled: !appLoading && !!id });

  const [relatedRecordsMap, setRelatedRecordsMap] = useState<Record<string, RecordResponseDto[]>>({});
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);

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

  useEffect(() => {
    if (properties.length === 0) {
      setRelatedRecordsMap({});
      return;
    }
    setIsRelatedLoading(true);
    fetchRelatedRecords(properties)
      .then(setRelatedRecordsMap)
      .catch(() => {})
      .finally(() => setIsRelatedLoading(false));
  }, [properties]);

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
    queryClient.invalidateQueries({ queryKey: queryKeys.records.all(id) });
  }, [id, queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.records.all(id) });
  }, [id, queryClient]);

  const applyDatabaseUpdate = useCallback(
    (updated: DatabaseResponseDto) => {
      updateDatabaseInSpace(updated);
    },
    [updateDatabaseInSpace],
  );

  const applyPropertiesUpdate = useCallback(
    (updated: PropertyResponseDto[]) => {
      queryClient.setQueryData(queryKeys.properties.all(id), updated);
    },
    [id, queryClient],
  );

  const isLoading = appLoading || isPropsLoading || isRecsLoading || isRelatedLoading;
  const error = propsError ? parseApiError(propsError) : recsError ? parseApiError(recsError) : null;

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
        applyDatabaseUpdate,
        applyPropertiesUpdate,
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
