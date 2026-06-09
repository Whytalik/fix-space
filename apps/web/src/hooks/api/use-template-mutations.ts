import { queryKeys } from "@/lib/api/query-keys";
import { createTemplate, deleteTemplate, duplicateTemplate, updateTemplate, resetTemplate } from "@/lib/api/template";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTemplateDto, UpdateTemplateDto } from "@fixspace/domain";

export function useCreateTemplate(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateTemplateDto>) => createTemplate({ ...data, databaseId } as CreateTemplateDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(databaseId) });
    },
  });
}

export function useUpdateTemplate(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) => updateTemplate(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(databaseId) });
      queryClient.setQueryData(queryKeys.templates.detail(updated.id), updated);

      if (updated.isDefault) {
        queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(databaseId) });
      }
    },
  });
}

export function useDeleteTemplate(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(databaseId) });
    },
  });
}

export function useDuplicateTemplate(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(databaseId) });
    },
  });
}

export function useResetTemplate(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resetTemplate(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(databaseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(updated.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.values(updated.id) });
    },
  });
}
