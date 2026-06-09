import { useQuery } from "@tanstack/react-query";
import { getSectionSettings } from "@/lib/api/settings";

export function useSectionSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "section"],
    queryFn: getSectionSettings,
  });
}
