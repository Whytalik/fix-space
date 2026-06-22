import type {
  CreateIntegrationConnectionDto,
  ImportTradesDto,
  IntegrationConnectionResponseDto,
  PreviewTradesDto,
  PreviewTradesResponseDto,
  UpdateIntegrationConnectionDto,
} from "@fixspace/domain";
import { apiFetch } from "./client";

export function getIntegrationConnections() {
  return apiFetch<IntegrationConnectionResponseDto[]>("/integration-connections");
}

export function getIntegrationConnection(id: string) {
  return apiFetch<IntegrationConnectionResponseDto>(`/integration-connections/${id}`);
}

export function createIntegrationConnection(dto: CreateIntegrationConnectionDto) {
  return apiFetch<IntegrationConnectionResponseDto>("/integration-connections", { method: "POST", body: dto });
}

export function updateIntegrationConnection(id: string, dto: UpdateIntegrationConnectionDto) {
  return apiFetch<IntegrationConnectionResponseDto>(`/integration-connections/${id}`, { method: "PATCH", body: dto });
}

export function deleteIntegrationConnection(id: string) {
  return apiFetch<void>(`/integration-connections/${id}`, { method: "DELETE" });
}

export function triggerIntegrationSync(id: string) {
  return apiFetch<void>(`/integration-connections/${id}/sync`, { method: "POST" });
}

export function previewIntegrationTrades(id: string, dto: PreviewTradesDto) {
  return apiFetch<PreviewTradesResponseDto>(`/integration-connections/${id}/trades/preview`, { method: "POST", body: dto });
}

export function importIntegrationTrades(id: string, dto: ImportTradesDto) {
  return apiFetch<{ created: number; skipped: number }>(`/integration-connections/${id}/trades/import`, { method: "POST", body: dto });
}
