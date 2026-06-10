import { useQuery } from "@tanstack/react-query";
import { getNotifications, getUnreadCount } from "@/lib/api/notification";

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    refetchInterval: 30000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getUnreadCount(),
    refetchInterval: 30000,
  });
}
