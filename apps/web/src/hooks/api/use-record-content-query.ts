import { useQuery } from "@tanstack/react-query";
import { getRecordContent, getRecordContentSnapshots } from "@/lib/api/record-content";

export function useRecordContentQuery(recordId: string) {
  return useQuery({
    queryKey: ["records", recordId, "content"],
    queryFn: () => getRecordContent(recordId),
    enabled: !!recordId,
  });
}

export function useRecordContentSnapshotsQuery(recordId: string) {
  return useQuery({
    queryKey: ["records", recordId, "content", "snapshots"],
    queryFn: () => getRecordContentSnapshots(recordId),
    enabled: !!recordId,
  });
}
