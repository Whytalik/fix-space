import { useQuery } from "@tanstack/react-query";
import { getProperties } from "@/lib/api/property";
import { queryKeys } from "@/lib/api/query-keys";
import type { PropertyResponseDto } from "@fixspace/domain";

export function usePropertiesQuery(databaseId: string, options?: { enabled?: boolean }) {
  return useQuery<PropertyResponseDto[]>({
    queryKey: queryKeys.properties.all(databaseId),
    queryFn: () => getProperties(databaseId),
    enabled: options?.enabled !== false && !!databaseId,
  });
}
