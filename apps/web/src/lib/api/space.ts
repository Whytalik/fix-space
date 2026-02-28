import type { SpaceResponseDto } from "@nucleus/domain";
import { apiFetch } from "./client";

export function getSpaces() {
  return apiFetch<SpaceResponseDto[]>("/spaces");
}
