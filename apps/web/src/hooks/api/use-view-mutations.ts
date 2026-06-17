import { queryKeys } from "@/lib/api/query-keys";
import { createView, deleteView, duplicateView, reorderViews, updateView } from "@/lib/api/view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateViewDto, UpdateViewDto, ViewResponseDto } from "@fixspace/domain";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function useCreateView(databaseId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("DatabaseViewTabs");

  return useMutation({
    mutationFn: (data: Partial<CreateViewDto>) => createView(databaseId, data),
    onSuccess: (newView) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) =>
        old ? [...old, newView] : [newView],
      );
    },
    onError: () => {
      toast.error(t("errorCreate"));
    },
  });
}

export function useUpdateView(databaseId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("DatabaseViewTabs");

  return useMutation({
    mutationFn: ({ viewId, data }: { viewId: string; data: UpdateViewDto }) => updateView(viewId, data),
    onSuccess: (updatedView) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) => {
        if (!old) return [updatedView];

        return old.map((view) => (view.id === updatedView.id ? updatedView : view));
      });
    },
    onError: () => {
      toast.error(t("errorUpdate"));
    },
  });
}

export function useDeleteView(databaseId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("DatabaseViewTabs");

  return useMutation({
    mutationFn: (viewId: string) => deleteView(viewId),
    onSuccess: (_, viewId) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) =>
        old ? old.filter((view) => view.id !== viewId) : [],
      );
    },
    onError: () => {
      toast.error(t("errorDelete"));
    },
  });
}

export function useDuplicateView(databaseId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("DatabaseViewTabs");

  return useMutation({
    mutationFn: (viewId: string) => duplicateView(viewId),
    onSuccess: (newView) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), (old: ViewResponseDto[] | undefined) =>
        old ? [...old, newView] : [newView],
      );
    },
    onError: () => {
      toast.error(t("errorDuplicate"));
    },
  });
}

export function useReorderViews(databaseId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("DatabaseViewTabs");

  return useMutation({
    mutationFn: (viewOrders: { id: string; position: number }[]) => reorderViews(databaseId, viewOrders),
    onSuccess: (updatedViews) => {
      queryClient.setQueryData(queryKeys.views.all(databaseId), updatedViews);
    },
    onError: () => {
      toast.error(t("errorReorder"));
    },
  });
}
