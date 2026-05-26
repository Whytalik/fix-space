import type { ChangePasswordDto, UpdateUserDto, UserResponseDto } from "@fixspace/domain";
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

export function changePassword(payload: ChangePasswordDto) {
  return apiFetch<{ message: string }>("/users/me/password", {
    method: "PATCH",
    body: payload,
  });
}

export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<UserResponseDto>("/users/me/avatar", { method: "POST", body: form });
}

export function deleteAvatar() {
  return apiFetch<UserResponseDto>("/users/me/avatar", { method: "DELETE" });
}
