import type { PropertyResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getProperties(databaseId: string) {
  return apiFetch<PropertyResponseDto[]>(`/properties?databaseId=${databaseId}`);
}

export function createProperty(databaseId: string, data: Record<string, unknown>) {
  return apiFetch<PropertyResponseDto>(`/properties`, {
    method: "POST",
    body: { ...data, databaseId },
  });
}

export function updateProperty(propertyId: string, data: Record<string, unknown>) {
  return apiFetch<PropertyResponseDto>(`/properties/${propertyId}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteProperty(propertyId: string) {
  return apiFetch<void>(`/properties/${propertyId}`, {
    method: "DELETE",
  });
}
