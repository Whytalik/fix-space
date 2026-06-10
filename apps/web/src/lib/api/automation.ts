import { apiFetch } from "./client";
import type { CreateAutomationDto, UpdateAutomationDto, AutomationResponseDto, AutomationLogResponseDto } from "@fixspace/domain";

export const automationApi = {
  create: async (dto: CreateAutomationDto): Promise<AutomationResponseDto> => {
    return apiFetch<AutomationResponseDto>("/automations", { method: "POST", body: dto });
  },
  findAll: async (databaseId: string): Promise<AutomationResponseDto[]> => {
    return apiFetch<AutomationResponseDto[]>(`/automations?databaseId=${databaseId}`);
  },
  findOne: async (id: string): Promise<AutomationResponseDto> => {
    return apiFetch<AutomationResponseDto>(`/automations/${id}`);
  },
  update: async ({ id, dto }: { id: string; dto: UpdateAutomationDto }): Promise<AutomationResponseDto> => {
    return apiFetch<AutomationResponseDto>(`/automations/${id}`, { method: "PATCH", body: dto });
  },
  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/automations/${id}`, { method: "DELETE" });
  },
  getLogs: async (id: string): Promise<AutomationLogResponseDto[]> => {
    return apiFetch<AutomationLogResponseDto[]>(`/automations/${id}/logs`);
  },
  test: async (id: string, recordId: string): Promise<{ results: string[]; status: string }> => {
    return apiFetch<{ results: string[]; status: string }>(`/automations/${id}/test`, {
      method: "POST",
      body: { recordId },
    });
  },
};
