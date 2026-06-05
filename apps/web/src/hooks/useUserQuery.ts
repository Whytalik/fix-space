import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/user";
import { queryKeys } from "@/lib/api/query-keys";
import type { UserResponseDto } from "@fixspace/domain";

export function useUserQuery(options?: { enabled?: boolean; initialData?: UserResponseDto | null }) {
  return useQuery<UserResponseDto>({
    queryKey: queryKeys.user.me(),
    queryFn: getMe,
    enabled: options?.enabled,
    initialData: options?.initialData ?? undefined,
  });
}
