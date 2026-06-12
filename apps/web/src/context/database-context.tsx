"use client";

import { usePropertiesQuery } from "@/hooks/api/use-properties-query";
import { useRecordsQuery } from "@/hooks/api/use-records-query";
import { useViewsQuery } from "@/hooks/api/use-views-query";
import { useCreateView, useDeleteView, useDuplicateView, useUpdateView } from "@/hooks/api/use-view-mutations";
import { queryKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { getRecords } from "@/lib/api/record";
import { parseApiError } from "@/lib/api/client";
import type {
  DatabaseResponseDto,
  PropertyResponseDto,
  RecordFilterDto,
  RecordGroupDto,
  RecordResponseDto,
  RecordSortDto,
  ViewResponseDto,
} from "@fixspace/domain";
import type { SummaryMetric } from "@fixspace/domain/enums";
import { FilterLogic, GroupField, PropertyType } from "@fixspace/domain/enums";

export interface GroupEntry {
  key: string;
  label: string;
  records: RecordResponseDto[];
}

import { useParams, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import { useAppContext } from "./app-context";
import { matchesFilter, compareRecords } from "@/utils/record/record-operations";

const DEFAULT_PAGE_SIZE = 25;

interface DatabaseContextValue {
  database: DatabaseResponseDto | null;
  properties: PropertyResponseDto[];
  records: RecordResponseDto[];
  allFilteredRecords: RecordResponseDto[];
  relatedRecordsMap: Record<string, RecordResponseDto[] | null>;
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
  views: ViewResponseDto[];
  activeView: ViewResponseDto | null;
  columnSummaries: Record<string, SummaryMetric>;
  isViewLocked: boolean;
  relativeDates: boolean;
  refresh: () => void;
  invalidateRecords: () => void;
  invalidateTemplates: () => void;
  applyDatabaseUpdate: (updated: DatabaseResponseDto) => void;
  applyPropertiesUpdate: (updated: PropertyResponseDto[]) => void;
  setActiveView: (viewId: string) => void;
  createView: (name: string) => Promise<ViewResponseDto>;
  updateActiveView: (data: Partial<ViewResponseDto>) => Promise<void>;
  deleteView: (viewId: string) => Promise<void>;
  duplicateView: (viewId: string) => Promise<ViewResponseDto>;
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
  setRelativeDates: (relative: boolean) => void;
  setHiddenColumns: (columns: string[]) => void;
  setColumnSummary: (propertyId: string, metric: SummaryMetric | null) => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  properties: [],
  records: [],
  allFilteredRecords: [],
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
  relativeDates: false,
  views: [],
  activeView: null,
  columnSummaries: {},
  isViewLocked: false,
  refresh: () => {},
  invalidateRecords: () => {},
  invalidateTemplates: () => {},
  applyDatabaseUpdate: () => {},
  applyPropertiesUpdate: () => {},
  setActiveView: () => {},
  createView: async () => ({}) as ViewResponseDto,
  updateActiveView: async () => {},
  deleteView: async () => {},
  duplicateView: async () => ({}) as ViewResponseDto,
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
  setRelativeDates: () => {},
  setHiddenColumns: () => {},
  setColumnSummary: () => {},
});

async function fetchRelatedRecords(props: PropertyResponseDto[]): Promise<Record<string, RecordResponseDto[] | null>> {
  const ids = [
    ...new Set(
      props
        .filter((prop) => prop.type === PropertyType.RELATION)
        .map((prop) => (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId)
        .filter(Boolean) as string[],
    ),
  ];
  if (ids.length === 0) return {};
  const entries = await Promise.all(
    ids.map((id) =>
      getRecords(id)
        .then((recs) => [id, recs] as const)
        .catch(() => [id, null] as const),
    ),
  );
  return Object.fromEntries(entries);
}

export function DatabaseProvider({ children, databaseId: propId }: { children: React.ReactNode; databaseId?: string }) {
  const params = useParams<{ id?: string }>();
  const databaseId = propId ?? params.id ?? "";
  const { databases, isLoading: appLoading, updateDatabaseInSpace, setCurrentDatabaseId } = useAppContext();

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";

  const database = useMemo(() => databases.find((db) => db.id === databaseId) ?? null, [databases, databaseId]);

  const {
    data: properties = [],
    isLoading: isPropsLoading,
    error: propsError,
  } = usePropertiesQuery(databaseId, { enabled: !appLoading && !!databaseId });

  const {
    data: allRecords = [],
    isLoading: isRecsLoading,
    error: recsError,
  } = useRecordsQuery(databaseId, { enabled: !appLoading && !!databaseId });

  const { data: views = [], isLoading: isViewsLoading } = useViewsQuery(databaseId, { enabled: !appLoading && !!databaseId });

  const createViewMutation = useCreateView(databaseId);
  const updateViewMutation = useUpdateView(databaseId);
  const deleteViewMutation = useDeleteView(databaseId);
  const duplicateViewMutation = useDuplicateView(databaseId);

  const [activeViewId, setActiveViewIdState] = useState<string | null>(null);
  const [relatedRecordsMap, setRelatedRecordsMap] = useState<Record<string, RecordResponseDto[] | null>>({});

  const [search, setSearch] = useState(initialSearch);
  const [sorts, setSortsState] = useState<RecordSortDto[]>([]);
  const [filters, setFiltersState] = useState<RecordFilterDto[]>([]);
  const [filterLogic, setFilterLogicState] = useState<FilterLogic>(FilterLogic.AND);
  const [group, setGroupState] = useState<RecordGroupDto | null>(null);
  const [groupColors, setGroupColorsState] = useState<Record<string, string>>({});
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());
  const [wrapCells, setWrapCellsState] = useState(false);
  const [relativeDates, setRelativeDatesState] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);
  const [columnSummaries, setColumnSummariesState] = useState<Record<string, SummaryMetric>>({});

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeView = useMemo(() => {
    if (!views.length) return null;
    return views.find((v) => v.id === activeViewId) || views[0] || null;
  }, [views, activeViewId]);

  const isViewLocked = activeView?.isLocked ?? false;

  const syncViewToServer = useCallback(
    (data: Record<string, unknown>) => {
      if (!activeView || isViewLocked) return;

      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      syncTimeoutRef.current = setTimeout(() => {
        updateViewMutation.mutate({ viewId: activeView.id, data });
      }, 1000);
    },
    [activeView, isViewLocked, updateViewMutation],
  );

  useEffect(() => {
    if (databaseId) setCurrentDatabaseId(databaseId);
    return () => setCurrentDatabaseId(null);
  }, [databaseId, setCurrentDatabaseId]);

  const isInitialLoad = useRef(true);
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;

  useEffect(() => {
    const view = activeViewRef.current;
    if (view) {
      setSortsState(view.sort || []);
      setFiltersState(view.filters || []);
      setFilterLogicState(view.filterLogic || FilterLogic.AND);
      setWrapCellsState(view.textWrap || false);
      setRelativeDatesState(view.relativeDates || false);
      setPageSizeState(view.pageSize || DEFAULT_PAGE_SIZE);
      setColumnSummariesState(view.columnSummaries || {});
      setGroupColorsState(view.groupColors || {});
      setHiddenGroups(new Set(view.hiddenGroups || []));
      setGroupState(view.groupBy ? { field: GroupField.PROPERTY, propertyId: view.groupBy } : null);
      setPage(1);

      if (isInitialLoad.current && initialSearch) {
        isInitialLoad.current = false;
      } else {
        setSearch(view.searchQuery || "");
      }
    }
  }, [activeView?.id, initialSearch]);

  useEffect(() => {
    if (properties.length === 0) {
      setRelatedRecordsMap((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const relationIds = [
      ...new Set(
        properties
          .filter((prop) => prop.type === PropertyType.RELATION)
          .map((prop) => (prop.config as { relatedEntityId?: string } | null)?.relatedEntityId)
          .filter(Boolean) as string[],
      ),
    ];

    if (relationIds.length > 0) {
      setRelatedRecordsMap((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id of relationIds) {
          if (!(id in next)) {
            next[id] = null;
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      fetchRelatedRecords(properties)
        .then((newMap) => {
          setRelatedRecordsMap((prev) => ({ ...prev, ...newMap }));
        })
        .catch(() => {})
        .finally(() => {});
    }
  }, [properties]);

  const setSorts = useCallback(
    (value: RecordSortDto[]) => {
      if (isViewLocked) return;
      setSortsState(value);
      syncViewToServer({ sort: value });
      setPage(1);
    },
    [isViewLocked, syncViewToServer],
  );

  const setFilters = useCallback(
    (value: RecordFilterDto[]) => {
      if (isViewLocked) return;
      setFiltersState(value);
      syncViewToServer({ filters: value });
      setPage(1);
    },
    [isViewLocked, syncViewToServer],
  );

  const setFilterLogic = useCallback(
    (value: FilterLogic) => {
      if (isViewLocked) return;
      setFilterLogicState(value);
      syncViewToServer({ filterLogic: value });
    },
    [isViewLocked, syncViewToServer],
  );

  const setWrapCells = useCallback(
    (value: boolean) => {
      if (isViewLocked) return;
      setWrapCellsState(value);
      syncViewToServer({ textWrap: value });
    },
    [isViewLocked, syncViewToServer],
  );

  const setRelativeDates = useCallback(
    (value: boolean) => {
      if (isViewLocked) return;
      setRelativeDatesState(value);
      syncViewToServer({ relativeDates: value });
    },
    [isViewLocked, syncViewToServer],
  );

  const setHiddenColumns = useCallback(
    (columns: string[]) => {
      if (isViewLocked) return;
      syncViewToServer({ hiddenColumns: columns });
    },
    [isViewLocked, syncViewToServer],
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      syncViewToServer({ pageSize: size });
      setPage(1);
    },
    [syncViewToServer],
  );

  const setColumnSummary = useCallback(
    (propertyId: string, metric: SummaryMetric | null) => {
      setColumnSummariesState((prev) => {
        const next = { ...prev };
        if (metric) next[propertyId] = metric;
        else delete next[propertyId];
        syncViewToServer({ columnSummaries: next });
        return next;
      });
    },
    [syncViewToServer],
  );

  const setGroup = useCallback(
    (value: RecordGroupDto | null) => {
      if (isViewLocked) return;
      setGroupState(value);
      syncViewToServer({ groupBy: value?.propertyId || null });
    },
    [isViewLocked, syncViewToServer],
  );

  const handleSetSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const setGroupColor = useCallback(
    (key: string, color: string) => {
      if (isViewLocked) return;
      setGroupColorsState((prev) => {
        const next = { ...prev, [key]: color };
        syncViewToServer({ groupColors: next });
        return next;
      });
    },
    [isViewLocked, syncViewToServer],
  );

  const toggleHiddenGroup = useCallback(
    (key: string) => {
      if (isViewLocked) return;
      setHiddenGroups((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        syncViewToServer({ hiddenGroups: Array.from(next) });
        return next;
      });
    },
    [isViewLocked, syncViewToServer],
  );

  const setActiveView = useCallback((viewId: string) => {
    setActiveViewIdState(viewId);
  }, []);

  const createView = useCallback(
    async (name: string) => {
      const res = await createViewMutation.mutateAsync({ name, databaseId });
      setActiveViewIdState(res.id);
      return res;
    },
    [databaseId, createViewMutation],
  );

  const updateActiveView = useCallback(
    async (data: Record<string, unknown>) => {
      if (!activeView) return;
      await updateViewMutation.mutateAsync({ viewId: activeView.id, data });
    },
    [activeView, updateViewMutation],
  );

  const deleteView = useCallback(
    async (viewId: string) => {
      await deleteViewMutation.mutateAsync(viewId);
      if (activeViewId === viewId) {
        setActiveViewIdState(null);
      }
    },
    [activeViewId, deleteViewMutation],
  );

  const duplicateView = useCallback(
    async (viewId: string) => {
      const res = await duplicateViewMutation.mutateAsync(viewId);
      setActiveViewIdState(res.id);
      return res;
    },
    [duplicateViewMutation],
  );

  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    if (search && search.length >= 2) {
      const lower = search.toLowerCase();
      result = result.filter((record) => {
        if (record.name?.toLowerCase().includes(lower)) return true;

        if (record.values) {
          for (const entry of record.values) {
            if (entry.value == null) continue;
            if (typeof entry.value === "string" && entry.value.toLowerCase().includes(lower)) return true;
            if (Array.isArray(entry.value)) {
              if (entry.value.some((v) => typeof v === "string" && v.toLowerCase().includes(lower))) return true;
            }
          }
        }
        return false;
      });
    }

    if (filters.length > 0) {
      result = result.filter((record) => {
        if (filterLogic === FilterLogic.OR) {
          return filters.some((filter) => matchesFilter(record, filter, properties));
        }
        return filters.every((filter) => matchesFilter(record, filter, properties));
      });
    }

    if (sorts.length > 0) {
      result.sort((a, b) => compareRecords(a, b, sorts));
    }

    return result;
  }, [allRecords, search, filters, filterLogic, properties, sorts]);

  const total = filteredRecords.length;

  const records = useMemo(() => {
    if (group) return filteredRecords;
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize, group]);

  const groupedRecords = useMemo<GroupEntry[] | null>(() => {
    if (!group) return null;
    const groups = new Map<string, GroupEntry>();

    for (const record of filteredRecords) {
      let key = "unknown";
      let label = "Unknown";

      if (group.field === GroupField.PROPERTY && group.propertyId) {
        const property = properties.find((p) => p.id === group.propertyId);
        const propertyValue = record.values?.find((v) => v.propertyId === group.propertyId);

        let value = propertyValue?.value;
        if ((value === null || value === undefined || value === "") && property?.position === 0 && property?.type === PropertyType.TEXT) {
          value = record.name;
        }

        if (value === null || value === undefined || value === "") {
          key = "empty";
          label = "Empty";
        } else if (Array.isArray(value)) {
          key = value.join(",");
          label = value.join(", ");
        } else if (typeof value === "object" && value !== null) {
          key = JSON.stringify(value);
          const valueObject = value as Record<string, unknown>;
          label = String(valueObject.label || valueObject.value || "Object");
        } else {
          key = String(value ?? "");
          label = String(value ?? "");
        }
      } else if (group.field === GroupField.CREATED_AT || group.field === GroupField.UPDATED_AT) {
        const dateString = group.field === GroupField.CREATED_AT ? record.createdAt : record.updatedAt;
        const date = new Date(dateString);
        key = date.toISOString().split("T")[0] ?? "unknown";
        label = key;
      }

      if (!groups.has(key)) groups.set(key, { key, label, records: [] });
      groups.get(key)!.records.push(record);
    }
    return groups.size > 0 ? Array.from(groups.values()) : null;
  }, [filteredRecords, group, properties]);

  const invalidateRecords = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
  }, [databaseId, queryClient]);

  const invalidateTemplates = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(databaseId) });
  }, [databaseId, queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all(databaseId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.views.all(databaseId) });
    invalidateTemplates();
  }, [databaseId, queryClient, invalidateTemplates]);

  const applyDatabaseUpdate = useCallback(
    (updated: DatabaseResponseDto) => {
      updateDatabaseInSpace(updated);
    },
    [updateDatabaseInSpace],
  );

  const applyPropertiesUpdate = useCallback(
    (updated: PropertyResponseDto[]) => {
      queryClient.setQueryData(queryKeys.properties.all(databaseId), updated);
    },
    [databaseId, queryClient],
  );

  const isLoading = appLoading || isPropsLoading || isRecsLoading || isViewsLoading;
  const error = propsError ? parseApiError(propsError) : recsError ? parseApiError(recsError) : null;

  return (
    <DatabaseContext.Provider
      value={{
        database,
        properties,
        records,
        allFilteredRecords: filteredRecords,
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
        relativeDates,
        views,
        activeView,
        columnSummaries,
        isViewLocked,
        refresh,
        invalidateRecords,
        invalidateTemplates,
        applyDatabaseUpdate,
        applyPropertiesUpdate,
        setActiveView,
        createView,
        updateActiveView,
        deleteView,
        duplicateView,
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
        setRelativeDates,
        setHiddenColumns,
        setColumnSummary,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  return useContext(DatabaseContext);
}
