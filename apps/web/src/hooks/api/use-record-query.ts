import { useQuery } from "@tanstack/react-query";
import { getRecord } from "@/lib/api/record";
import type { RecordResponseDto } from "@fixspace/domain";

export function useRecordQuery(recordId: string, options?: { enabled?: boolean }) {
  return useQuery<RecordResponseDto>({
    queryKey: ["records", "detail", recordId],
    queryFn: () => getRecord(recordId),
    enabled: options?.enabled !== false && !!recordId,
  });
}
