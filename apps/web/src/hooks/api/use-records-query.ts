import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getRecords, getRecordsPage } from "@/lib/api/record";
import { queryKeys } from "@/lib/api/query-keys";
import type { RecordResponseDto } from "@fixspace/domain";

const API_PAGE_SIZE = 200;

export function useRecordsQuery(databaseId: string, options?: { enabled?: boolean }) {
  return useQuery<RecordResponseDto[]>({
    queryKey: queryKeys.records.all(databaseId),
    queryFn: () => getRecords(databaseId),
    enabled: options?.enabled !== false && !!databaseId,
  });
}

export function useInfiniteRecordsQuery(databaseId: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: queryKeys.records.infinite(databaseId),
    queryFn: ({ pageParam }) => getRecordsPage(databaseId, pageParam, API_PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled !== false && !!databaseId,
  });
}
