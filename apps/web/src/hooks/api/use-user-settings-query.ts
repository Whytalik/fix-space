import { useQuery } from "@tanstack/react-query";
import { getUserSettings } from "@/lib/api/settings";

export function useUserSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "user"],
    queryFn: getUserSettings,
  });
}
