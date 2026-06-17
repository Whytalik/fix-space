"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { Bell, CheckCheck, CircleAlert, Info, Trash2, Bot, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useNotificationsQuery } from "@/hooks/api/use-notifications-query";
import { useNotificationMutations } from "@/hooks/api/use-notification-mutations";
import { useDateFormat } from "@/hooks/format/use-date-format";
import { useUIContext } from "@/context/ui-context";
import { NotificationType } from "@fixspace/domain";
import { useRouter } from "@/i18n/navigation";

type NotificationsModalProps = {
  onClose: () => void;
};

export function NotificationsModal({ onClose }: NotificationsModalProps) {
  const t = useTranslations("NotificationsModal");
  const router = useRouter();
  const { formatDateTime } = useDateFormat();
  const { openSettings } = useUIContext();
  const { data: notifications = [], isLoading } = useNotificationsQuery();
  const { markAllReadMutation, markReadMutation, clearMutation } = useNotificationMutations();

  const hasUnread = useMemo(() => notifications.some((notification) => !notification.isRead), [notifications]);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications]);

  function handleClearAll() {
    clearMutation.mutate();
  }

  function handleNotificationClick(id: string, isRead: boolean, link?: string | null) {
    if (!isRead) {
      markReadMutation.mutate(id);
    }
    if (link === "/settings") {
      onClose();
      openSettings("integration");
    } else if (link) {
      router.push(link);
      onClose();
    }
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ERROR:
        return <CircleAlert size={16} className="text-error" />;
      case NotificationType.AUTOMATION:
        return <Bot size={16} className="text-success" />;
      case NotificationType.INTEGRATION:
        return <Link2 size={16} className="text-accent" />;
      case NotificationType.INFO:
      default:
        return <Info size={16} className="text-accent" />;
    }
  };

  const getTitle = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ERROR:
        return t("types.error") || "Error";
      case NotificationType.AUTOMATION:
        return t("types.automation") || "Automation";
      case NotificationType.INTEGRATION:
        return t("types.integration") || "Integration";
      case NotificationType.INFO:
      default:
        return t("types.info") || "Information";
    }
  };

  return (
    <ModalShell
      isOpen={true}
      onClose={onClose}
      title={t("title")}
      size="lg"
      headerPrefix={
        <>
          <Bell size={16} className="text-ink-secondary" />
          {unreadCount > 0 && <span className="bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
        </>
      }
      headerSuffix={
        notifications.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              disabled={!hasUnread || markAllReadMutation.isPending}
              className="flex items-center gap-1 text-xs text-ink-secondary hover:text-ink disabled:opacity-50 disabled:hover:text-ink-secondary transition-colors duration-150 font-medium"
            >
              <CheckCheck size={14} />
              <span>{t("markAllAsRead")}</span>
            </button>
            <span className="h-3.5 w-px bg-stroke" />
            <button
              type="button"
              onClick={handleClearAll}
              disabled={clearMutation.isPending}
              className="flex items-center gap-1 text-xs text-error hover:text-error/80 transition-colors duration-150 font-medium"
            >
              <Trash2 size={14} />
              <span>{t("clearAll")}</span>
            </button>
          </>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-2 text-ink-muted">
          <Bell size={24} className="opacity-50" />
          <p className="text-sm font-medium">{t("noNotifications")}</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id, notification.isRead, notification.link)}
              className={`flex items-start gap-3 w-full px-0 py-3.5 text-left border-b border-stroke last:border-b-0 transition-colors duration-150 ${
                notification.isRead ? "hover:bg-surface/50 opacity-70" : "bg-accent-muted/5 hover:bg-accent-muted/10"
              }`}
            >
              <span className="shrink-0 mt-0.5">{getIcon(notification.type)}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm ${notification.isRead ? "text-ink-secondary" : "text-ink font-semibold"}`}>
                    {getTitle(notification.type)}
                  </p>
                  <span className="text-xs text-ink-muted whitespace-nowrap">{formatDateTime(notification.createdAt, {}, true)}</span>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{notification.text}</p>
              </div>
              {!notification.isRead && <span className="shrink-0 w-2 h-2 rounded-full bg-accent mt-2" />}
            </button>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
