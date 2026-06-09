import { queryKeys } from "@/lib/api/query-keys";
import { createView, deleteView, duplicateView, updateView } from "@/lib/api/view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateViewDto, UpdateViewDto, ViewResponseDto } from "@fixspace/domain";

export function useCreateView(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateViewDto>) => createView(databaseId, data),
    onSuccess: (newView) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) =>
        old ? [...old, newView] : [newView],
      );
    },
  });
}

export function useUpdateView(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ viewId, data }: { viewId: string; data: UpdateViewDto }) => updateView(viewId, data),
    onSuccess: (updatedView) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) => {
        if (!old) return [updatedView];

        return old.map((view) => (view.id === updatedView.id ? updatedView : view));
      });
    },
  });
}

export function useDeleteView(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (viewId: string) => deleteView(viewId),
    onSuccess: (_, viewId) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) =>
        old ? old.filter((view) => view.id !== viewId) : [],
      );
    },
  });
}

export function useDuplicateView(databaseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (viewId: string) => duplicateView(viewId),
    onSuccess: (newView) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) =>
        old ? [...old, newView] : [newView],
      );
    },
  });
}
