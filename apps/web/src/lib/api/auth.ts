import type { AuthResponseDto, LoginUserDto, RegisterUserDto, SessionResponseDto } from "@fixspace/domain";
import { apiFetch } from "./client";

export function login(dto: LoginUserDto) {
  return apiFetch<AuthResponseDto>("/auth/login", {
    method: "POST",
    body: dto,
  });
}

export function register(dto: RegisterUserDto) {
  return apiFetch<{
    message: string;
  }>("/auth/register", {
    method: "POST",
    body: dto,
  });
}

export function logout() {
  return apiFetch<{
    message: string;
  }>("/auth/logout", {
    method: "POST",
  });
}

export function logoutAll() {
  return apiFetch<{
    message: string;
  }>("/auth/logout-all", {
    method: "POST",
  });
}

export function refresh() {
  return apiFetch<AuthResponseDto>("/auth/refresh", {
    method: "POST",
  });
}

export function forgotPassword(email: string) {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
}

export function devVerifyUser(email: string) {
  return apiFetch<{
    message: string;
  }>("/auth/dev/verify-user", {
    method: "POST",
    body: { email },
  });
}

export function verifyEmail(token: string) {
  return apiFetch<{ message: string }>("/auth/verify", {
    method: "POST",
    body: { token },
  });
}

export function resendVerification(email: string) {
  return apiFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: { email },
  });
}

export function getSessions() {
  return apiFetch<SessionResponseDto[]>("/auth/sessions");
}

export function revokeSession(id: string) {
  return apiFetch<{ message: string }>(`/auth/sessions/${id}`, {
    method: "DELETE",
  });
}
