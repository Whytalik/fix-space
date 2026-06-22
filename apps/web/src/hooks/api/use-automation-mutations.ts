import { useMutation, useQueryClient } from "@tanstack/react-query";
import { automationApi } from "@/lib/api/automation";

export function useAutomationMutations(databaseId?: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["automations", databaseId] });
  };

  const create = useMutation({
    mutationFn: automationApi.create,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: automationApi.update,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: automationApi.delete,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
