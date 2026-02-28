import type { AuthResponseDto, LoginUserDto, RegisterUserDto } from "@nucleus/domain";
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

export function refresh() {
  return apiFetch<AuthResponseDto>("/auth/refresh", {
    method: "POST",
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
