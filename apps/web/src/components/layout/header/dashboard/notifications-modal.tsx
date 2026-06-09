"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { AlertTriangle, Bell, CheckCheck, CircleAlert, Info, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type NotificationsModalProps = {
  onClose: () => void;
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New member joined",
    description: "Oksana joined workspace 'Diploma'",
    time: "2 hours ago",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Database duplicate success",
    description: "Successfully duplicated database 'Trading Log' in section 'Sections'",
    time: "4 hours ago",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Storage warning",
    description: "Your workspace is reaching 85% of storage limits.",
    time: "Yesterday",
    read: true,
    type: "warning",
  },
  {
    id: "4",
    title: "Database settings updated",
    description: "Vitalii updated properties configuration on 'Orders' database",
    time: "2 days ago",
    read: true,
    type: "info",
  },
];

export function NotificationsModal({ onClose }: NotificationsModalProps) {
  const t = useTranslations("NotificationsModal");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  function handleMarkAllAsRead() {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }

  function handleClearAll() {
    setNotifications([]);
  }

  function handleNotificationClick(id: string) {
    setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
  }

  const hasUnread = notifications.some((notification) => !notification.read);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <ModalShell
      isOpen={true}
      onClose={onClose}
      title={t("title")}
      size="lg"
      headerPrefix={
        <>
          <Bell size={16} className="text-ink-secondary" />
          {hasUnread && <span className="bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
        </>
      }
      headerSuffix={
        notifications.length > 0 ? (
          <>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={!hasUnread}
              className="flex items-center gap-1 text-xs text-ink-secondary hover:text-ink disabled:opacity-50 disabled:hover:text-ink-secondary transition-colors duration-150 font-medium"
            >
              <CheckCheck size={14} />
              <span>{t("markAllAsRead")}</span>
            </button>
            <span className="h-3.5 w-px bg-stroke" />
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs text-error hover:text-error/80 transition-colors duration-150 font-medium"
            >
              <Trash2 size={14} />
              <span>{t("clearAll")}</span>
            </button>
          </>
        ) : undefined
      }
    >
      {notifications.length === 0 ? (
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
              onClick={() => handleNotificationClick(notification.id)}
              className={`flex items-start gap-3 w-full px-0 py-3.5 text-left border-b border-stroke last:border-b-0 transition-colors duration-150 ${
                notification.read ? "hover:bg-surface/50 opacity-70" : "bg-accent-muted/5 hover:bg-accent-muted/10"
              }`}
            >
              <span className="shrink-0 mt-0.5">
                {notification.type === "success" && <CircleAlert size={16} className="text-success" />}
                {notification.type === "warning" && <AlertTriangle size={16} className="text-warning" />}
                {notification.type === "info" && <Info size={16} className="text-accent" />}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm ${notification.read ? "text-ink-secondary" : "text-ink font-semibold"}`}>{notification.title}</p>
                  <span className="text-xs text-ink-muted whitespace-nowrap">{notification.time}</span>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{notification.description}</p>
              </div>
              {!notification.read && <span className="shrink-0 w-2 h-2 rounded-full bg-accent mt-2" />}
            </button>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
