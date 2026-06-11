import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRecordContent, restoreRecordContentSnapshot } from "@/lib/api/record-content";
import type { UpdateRecordContentDto } from "@fixspace/domain";

export function useRecordContentMutations(recordId: string) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (dto: UpdateRecordContentDto) => updateRecordContent(recordId, dto),
    onSuccess: (data) => {
      queryClient.setQueryData(["records", recordId, "content"], data);
      queryClient.invalidateQueries({ queryKey: ["records", recordId, "content", "snapshots"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (snapshotId: string) => restoreRecordContentSnapshot(recordId, snapshotId),
    onSuccess: (data) => {
      queryClient.setQueryData(["records", recordId, "content"], data);
      queryClient.invalidateQueries({ queryKey: ["records", recordId, "content", "snapshots"] });
    },
  });

  return {
    updateMutation,
    restoreMutation,
  };
}
