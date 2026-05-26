import type { CreatePropertyDto, PropertyResponseDto, UpdatePropertyDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getProperties(databaseId: string) {
  return apiFetch<PropertyResponseDto[]>(`/properties?databaseId=${databaseId}`);
}

type CreatePropertyInput = Omit<CreatePropertyDto, "databaseId" | "config"> & { config?: Record<string, unknown> };

export function createProperty(databaseId: string, dto: CreatePropertyInput) {
  return apiFetch<PropertyResponseDto>(`/properties?databaseId=${databaseId}`, {
    method: "POST",
    body: dto,
  });
}

type UpdatePropertyInput = Omit<UpdatePropertyDto, "config" | "group"> & {
  config?: Record<string, unknown>;
  group?: string | null;
};

export function updateProperty(propertyId: string, dto: UpdatePropertyInput) {
  return apiFetch<PropertyResponseDto>(`/properties/${propertyId}`, {
    method: "PATCH",
    body: dto,
  });
}

export function deleteProperty(propertyId: string) {
  return apiFetch<PropertyResponseDto>(`/properties/${propertyId}`, {
    method: "DELETE",
  });
}
