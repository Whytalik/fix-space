import { useQuery } from "@tanstack/react-query";
import { automationApi } from "@/lib/api/automation";

export function useAutomationsQuery(databaseId: string) {
  return useQuery({
    queryKey: ["automations", databaseId],
    queryFn: () => automationApi.findAll(databaseId),
    enabled: !!databaseId,
  });
}

export function useAutomationLogsQuery(automationId: string, enabled = false) {
  return useQuery({
    queryKey: ["automation-logs", automationId],
    queryFn: () => automationApi.getLogs(automationId),
    enabled: !!automationId && enabled,
  });
}
