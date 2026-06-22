import { queryKeys } from "@/lib/api/query-keys";
import { getViews } from "@/lib/api/view";
import { useQuery } from "@tanstack/react-query";

export function useViewsQuery(databaseId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.views.all(databaseId),
    queryFn: () => getViews(databaseId),
    enabled: options.enabled,
    staleTime: 1000 * 60 * 5,
  });
}
