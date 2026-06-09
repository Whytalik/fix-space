import { queryKeys } from "@/lib/api/query-keys";
import { updateTemplatePropertyValue } from "@/lib/api/template-property-value";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTemplatePropertyValueDto } from "@fixspace/domain";

export function useUpdateTemplateValue(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplatePropertyValueDto }) => updateTemplatePropertyValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.values(templateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all("") });
    },
  });
}
