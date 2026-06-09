import { useQuery } from "@tanstack/react-query";
import { getSpaceSettings } from "@/lib/api/settings";

export function useSpaceSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "space"],
    queryFn: getSpaceSettings,
  });
}
