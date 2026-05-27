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

export async function uploadAvatar(file: File): Promise<UserResponseDto> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/users/me/avatar`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json() as Promise<UserResponseDto>;
}

export async function deleteAvatar(): Promise<UserResponseDto> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/users/me/avatar`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json() as Promise<UserResponseDto>;
}
