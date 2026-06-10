import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllAsRead, markAsRead, clearNotifications } from "@/lib/api/notification";

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => clearNotifications(),
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], []);
      queryClient.setQueryData(["notifications", "unread-count"], { count: 0 });
    },
  });

  return {
    markAllReadMutation,
    markReadMutation,
    clearMutation,
  };
}
