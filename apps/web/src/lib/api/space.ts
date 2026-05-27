import type { SpaceResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getSpaces() {
  return apiFetch<SpaceResponseDto[]>("/spaces");
}

export function updateSpace(
  spaceId: string,
  data: {
    name?: string;
    icon?: string;
    sectionOperations?: Array<
      | { operation: "CREATE"; create: { name: string; icon?: string; color?: string; position?: number } }
      | { operation: "UPDATE"; id: string; update: { name?: string; icon?: string; color?: string; position?: number } }
      | { operation: "DELETE"; id: string }
    >;
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

export function duplicateSpace(spaceId: string) {
  return apiFetch<SpaceResponseDto>(`/spaces/${spaceId}/duplicate`, {
    method: "POST",
  });
}

export function deleteSpace(spaceId: string) {
  return apiFetch(`/spaces/${spaceId}`, {
    method: "DELETE",
  });
}
