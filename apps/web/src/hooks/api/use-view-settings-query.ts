import { useQuery } from "@tanstack/react-query";
import { getViewSettings } from "@/lib/api/settings";

export function useViewSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "view"],
    queryFn: getViewSettings,
  });
}
