import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getViewSettings } from "@/lib/api/settings";

export function useViewSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.view(),
    queryFn: getViewSettings,
  });
}
