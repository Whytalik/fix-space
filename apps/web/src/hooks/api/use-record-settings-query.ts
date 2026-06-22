import { useQuery } from "@tanstack/react-query";
import { getRecordSettings } from "@/lib/api/settings";

export function useRecordSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "record"],
    queryFn: getRecordSettings,
  });
}
