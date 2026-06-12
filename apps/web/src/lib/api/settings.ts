import type {
  DatabaseSettings,
  RecordSettings,
  SectionSettings,
  SpaceSettings,
  TemplateSettings,
  UserSettings,
  ViewSettings,
} from "@fixspace/domain";
import { apiFetch } from "./client";

export function getUserSettings() {
  return apiFetch<UserSettings>("/settings/user");
}

export function updateUserSettings(data: Partial<UserSettings>) {
  return apiFetch<UserSettings>("/settings/user", { method: "PATCH", body: data });
}

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

export function getTemplateSettings() {
  return apiFetch<TemplateSettings>("/settings/template");
}

export function updateTemplateSettings(data: Partial<TemplateSettings>) {
  return apiFetch<TemplateSettings>("/settings/template", { method: "PATCH", body: data });
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

export function getViewSettings() {
  return apiFetch<ViewSettings>("/settings/view");
}

export function updateViewSettings(data: Partial<ViewSettings>) {
  return apiFetch<ViewSettings>("/settings/view", { method: "PATCH", body: data });
}
