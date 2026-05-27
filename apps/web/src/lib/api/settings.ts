import type { DatabaseSettings, RecordSettings, SectionSettings, SpaceSettings } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getSpaceSettings() {
  return apiFetch<SpaceSettings>("/settings/space");
}

export function getDatabaseSettings() {
  return apiFetch<DatabaseSettings>("/settings/database");
}

export function getSectionSettings() {
  return apiFetch<SectionSettings>("/settings/section");
}

export function updateSpaceSettings(data: Partial<SpaceSettings>) {
  return apiFetch<SpaceSettings>("/settings/space", { method: "PATCH", body: data });
}

export function updateDatabaseSettings(data: Partial<DatabaseSettings>) {
  return apiFetch<DatabaseSettings>("/settings/database", { method: "PATCH", body: data });
}

export function updateSectionSettings(data: Partial<SectionSettings>) {
  return apiFetch<SectionSettings>("/settings/section", { method: "PATCH", body: data });
}

export function getRecordSettings() {
  return apiFetch<RecordSettings>("/settings/record");
}

export function updateRecordSettings(data: Partial<RecordSettings>) {
  return apiFetch<RecordSettings>("/settings/record", { method: "PATCH", body: data });
}
