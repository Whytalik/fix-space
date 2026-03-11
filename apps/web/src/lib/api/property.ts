import type { PropertyResponseDto } from "@nucleus/domain";
import { apiFetch } from "./client";

export function getProperties(databaseId: string) {
  return apiFetch<PropertyResponseDto[]>(`/properties?databaseId=${databaseId}`);
}

export function updateProperty(propertyId: string, data: { position: number }) {
  return apiFetch<PropertyResponseDto>(`/properties/${propertyId}`, {
    method: "PATCH",
    body: data,
  });
}
