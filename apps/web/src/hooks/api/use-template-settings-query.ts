import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplateSettings, updateTemplateSettings } from "@/lib/api/settings";
import type { TemplateSettings } from "@fixspace/domain";

export function useTemplateSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "template"],
    queryFn: getTemplateSettings,
  });
}

export function useUpdateTemplateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TemplateSettings>) => updateTemplateSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["settings", "template"], updated);
    },
  });
}
