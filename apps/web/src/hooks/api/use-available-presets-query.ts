import { useQuery } from "@tanstack/react-query";
import { getAvailablePresets } from "@/lib/api/database";

export function useAvailablePresetsQuery() {
  return useQuery({
    queryKey: ["available-presets"],
    queryFn: getAvailablePresets,
  });
}
