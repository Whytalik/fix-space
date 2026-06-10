import { apiFetch } from "./client";
import type { NotificationResponseDto, UnreadCountResponseDto } from "@fixspace/domain";

export async function getNotifications(): Promise<NotificationResponseDto[]> {
  return apiFetch<NotificationResponseDto[]>("/notifications");
}

export async function getUnreadCount(): Promise<UnreadCountResponseDto> {
  return apiFetch<UnreadCountResponseDto>("/notifications/unread-count");
}

export async function markAllAsRead(): Promise<void> {
  return apiFetch("/notifications/mark-all-as-read", { method: "PATCH" });
}

export async function markAsRead(id: string): Promise<NotificationResponseDto> {
  return apiFetch<NotificationResponseDto>(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function clearNotifications(): Promise<void> {
  return apiFetch("/notifications", { method: "DELETE" });
}
