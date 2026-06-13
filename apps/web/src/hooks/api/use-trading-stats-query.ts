import { useQuery } from "@tanstack/react-query";

import { getTradingStats, type StatisticsQuery } from "@/lib/api/statistics";
import { queryKeys } from "@/lib/api/query-keys";

export function useTradingStatsQuery(query: StatisticsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.statistics.trading(query.from, query.to, query.compareFrom, query.compareTo),
    queryFn: () => getTradingStats(query),
  });
}
