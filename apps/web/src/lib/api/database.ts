import type { AvailablePresetTypeDto, DatabaseResponseDto, DuplicateDatabaseDto, RestorePresetDatabaseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function updateDatabase(
  spaceId: string,
  databaseId: string,
  data: {
    name?: string;
    title?: string;
    icon?: string;
    sectionId?: string | null;
    position?: number;
    recordLimit?: number | null;
    useDefaultTemplate?: boolean;
    isLocked?: boolean;
  },
) {
  return apiFetch<DatabaseResponseDto>(`/databases/${databaseId}`, {
    method: "PATCH",
    body: data,
  });
}

export function createDatabase(spaceId: string, data: { name: string; title: string; type?: string; sectionId?: string; icon?: string }) {
  return apiFetch<DatabaseResponseDto>(`/databases`, {
    method: "POST",
    body: { ...data, spaceId },
  });
}

export function getAvailablePresets() {
  return apiFetch<AvailablePresetTypeDto[]>("/databases/available-preset-types");
}

export function restorePreset(data: RestorePresetDatabaseDto) {
  return apiFetch<DatabaseResponseDto>("/databases/restore-preset", {
    method: "POST",
    body: data,
  });
}

export function deleteDatabase(spaceId: string, databaseId: string) {
  return apiFetch(`/databases/${databaseId}`, { method: "DELETE" });
}

export function duplicateDatabase(spaceId: string, databaseId: string, options: DuplicateDatabaseDto = {}) {
  return apiFetch<DatabaseResponseDto>(`/databases/${databaseId}/duplicate`, {
    method: "POST",
    body: options,
  });
}
