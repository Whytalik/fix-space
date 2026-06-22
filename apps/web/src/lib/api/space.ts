import type { DashboardResponseDto, DuplicateSpaceDto, SectionResponseDto, SpaceResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getSpaces() {
  return apiFetch<SpaceResponseDto[]>("/spaces");
}

export function updateSpace(
  spaceId: string,
  data: {
    name?: string;
    icon?: string;
    isDefault?: boolean;
    sectionOperations?: Array<
      | { operation: "CREATE"; create: { name: string; icon?: string; color?: string; position?: number } }
      | { operation: "UPDATE"; id: string; update: { name?: string; icon?: string; color?: string; position?: number } }
      | { operation: "DELETE"; id: string }
    >;
    databaseOperations?: Array<{
      id: string;
      update: { position: number };
    }>;
  },
) {
  return apiFetch<SpaceResponseDto>(`/spaces/${spaceId}`, {
    method: "PATCH",
    body: data,
  });
}

export function createSpace(data: { name: string; icon?: string }) {
  return apiFetch<SpaceResponseDto>("/spaces", {
    method: "POST",
    body: data,
  });
}

export function duplicateSpace(spaceId: string, options: DuplicateSpaceDto = {}) {
  return apiFetch<SpaceResponseDto>(`/spaces/${spaceId}/duplicate`, {
    method: "POST",
    body: options,
  });
}

export function duplicateSection(spaceId: string, sectionId: string, options: DuplicateSpaceDto = {}) {
  return apiFetch<SectionResponseDto>(`/spaces/${spaceId}/sections/${sectionId}/duplicate`, {
    method: "POST",
    body: options,
  });
}

export function deleteSpace(spaceId: string) {
  return apiFetch(`/spaces/${spaceId}`, {
    method: "DELETE",
  });
}

export function getDashboard(spaceId: string) {
  return apiFetch<DashboardResponseDto>(`/spaces/${spaceId}/dashboard`);
}
