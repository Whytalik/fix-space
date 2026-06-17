import type { ChangePasswordDto, DeleteAccountDto, SetPasswordDto, UpdateUserDto, UserResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function getMe() {
  return apiFetch<UserResponseDto>("/users/me", { noRedirect: true });
}

export function updateMe(payload: UpdateUserDto) {
  return apiFetch<UserResponseDto>("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function deleteMe(payload: DeleteAccountDto) {
  return apiFetch<{ message: string }>("/users/me", {
    method: "DELETE",
    body: payload,
  });
}

export function setPassword(payload: SetPasswordDto) {
  return apiFetch<{ message: string }>("/users/me/password", {
    method: "POST",
    body: payload,
  });
}

export function changePassword(payload: ChangePasswordDto) {
  return apiFetch<{ message: string }>("/users/me/password", {
    method: "PATCH",
    body: payload,
  });
}

export function uploadAvatar(file: File | Blob) {
  const form = new FormData();
  form.append("avatar", file);
  return apiFetch<UserResponseDto>("/users/me/avatar", { method: "POST", body: form });
}

export function deleteAvatar() {
  return apiFetch<UserResponseDto>("/users/me/avatar", { method: "DELETE" });
}
