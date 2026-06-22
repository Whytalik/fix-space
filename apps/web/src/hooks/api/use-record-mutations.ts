import { queryKeys } from "@/lib/api/query-keys";
import { applyTemplateToRecord, createRecord, deleteRecord, duplicateRecord, updateRecord } from "@/lib/api/record";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateRecord(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; icon?: string; templateId?: string | null; viewId?: string }) => createRecord(databaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
    },
  });
}

export function useUpdateRecord(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; icon?: string } }) => updateRecord(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
      queryClient.setQueryData(queryKeys.records.detail(databaseId, updated.id), updated);
    },
  });
}

export function useDeleteRecord(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
    },
  });
}

export function useDuplicateRecord(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
    },
  });
}

export function useApplyTemplate(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, templateId }: { recordId: string; templateId: string }) => applyTemplateToRecord(recordId, templateId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records.all(databaseId) });
      queryClient.setQueryData(queryKeys.records.detail(databaseId, updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ["records", "detail", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["records", updated.id, "content"] });
    },
  });
}
