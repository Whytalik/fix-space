import { useQuery } from "@tanstack/react-query";
import { getSpaces } from "@/lib/api/space";
import { queryKeys } from "@/lib/api/query-keys";
import type { SpaceResponseDto } from "@fixspace/domain";

export function useSpacesQuery(options?: { enabled?: boolean; initialData?: SpaceResponseDto[] }) {
  return useQuery<SpaceResponseDto[]>({
    queryKey: queryKeys.spaces.all(),
    queryFn: getSpaces,
    enabled: options?.enabled,
    initialData: options?.initialData,
  });
}
