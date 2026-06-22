import { useQuery } from "@tanstack/react-query";
import { getDatabaseSettings } from "@/lib/api/settings";

export function useDatabaseSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "database"],
    queryFn: getDatabaseSettings,
  });
}
