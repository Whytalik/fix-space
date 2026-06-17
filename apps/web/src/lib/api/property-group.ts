import type { PropertyGroupResponseDto } from "@fixspace/domain";
import type { VisibilityConditionDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getPropertyGroups(databaseId: string) {
  return apiFetch<PropertyGroupResponseDto[]>(`/property-groups?databaseId=${databaseId}`);
}

export function createPropertyGroup(databaseId: string, name: string, visibility?: VisibilityConditionDto | null) {
  return apiFetch<PropertyGroupResponseDto>("/property-groups", {
    method: "POST",
    body: { databaseId, name, ...(visibility !== undefined ? { visibility } : {}) },
  });
}

export function updatePropertyGroup(id: string, data: { name?: string; visibility?: VisibilityConditionDto | null }) {
  return apiFetch<PropertyGroupResponseDto>(`/property-groups/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deletePropertyGroup(id: string) {
  return apiFetch<void>(`/property-groups/${id}`, { method: "DELETE" });
}
