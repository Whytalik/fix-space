import { useQuery } from "@tanstack/react-query";

import { getCustomStats, type StatisticsQuery } from "@/lib/api/statistics";
import { queryKeys } from "@/lib/api/query-keys";

export function useCustomStatsQuery(query: StatisticsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.statistics.custom(query.from, query.to),
    queryFn: () => getCustomStats(query),
  });
}
