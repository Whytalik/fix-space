"use client";

import { useQuery } from "@tanstack/react-query";

import { getKeyDatabasesOverview, type StatisticsQuery } from "@/lib/api/statistics";
import { queryKeys } from "@/lib/api/query-keys";

export function usePresetOverviewQuery(query: StatisticsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.statistics.overview(query.spaceId, query.from, query.to, query.compareFrom, query.compareTo),
    queryFn: () => getKeyDatabasesOverview(query),
  });
}
