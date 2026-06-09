import { queryKeys } from "@/lib/api/query-keys";
import { getTemplate, getTemplates } from "@/lib/api/template";
import { useQuery } from "@tanstack/react-query";

export function useTemplatesQuery(databaseId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.templates.all(databaseId),
    queryFn: () => getTemplates(databaseId),
    enabled: options.enabled && !!databaseId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTemplateQuery(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.templates.detail(id),
    queryFn: () => getTemplate(id),
    enabled: options.enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
}
