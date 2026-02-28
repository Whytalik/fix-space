import type { UpdateUserDto, UserResponseDto } from "@nucleus/domain";
import { apiFetch } from "./client";

export function getMe() {
  return apiFetch<UserResponseDto>("/users/me");
}

export function updateMe(payload: UpdateUserDto) {
  return apiFetch<UserResponseDto>("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function deleteMe() {
  return apiFetch<void>("/users/me", {
    method: "DELETE",
  });
}
