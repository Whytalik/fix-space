import { useQuery } from "@tanstack/react-query";
import { getRecords } from "@/lib/api/record";
import { queryKeys } from "@/lib/api/query-keys";
import type { RecordResponseDto } from "@fixspace/domain";

export function useRecordsQuery(databaseId: string, options?: { enabled?: boolean }) {
  return useQuery<RecordResponseDto[]>({
    queryKey: queryKeys.records.all(databaseId),
    queryFn: () => getRecords(databaseId),
    enabled: options?.enabled !== false && !!databaseId,
  });
}
