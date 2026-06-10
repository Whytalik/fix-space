import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType as PrismaNotificationType } from "@fixspace/database";
import { NotificationResponseDto, UnreadCountResponseDto, NotificationType as DomainNotificationType } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { NotificationRepository } from "./repositories/notification.repository";

@Injectable()
export class NotificationService {
  private readonly MAX_NOTIFICATIONS = 50;

  constructor(
    private readonly logger: AppLogger,
    private readonly notificationRepo: NotificationRepository,
  ) {
    this.logger.setContext(NotificationService.name);
  }

  async findAll(userId: string): Promise<NotificationResponseDto[]> {
    this.logger.debug("Finding all notifications", { userId });
    const notifications = await this.notificationRepo.findAllByUserId(userId);
    return notifications.map(
      (notification) =>
        new NotificationResponseDto({
          ...notification,
          type: notification.type as unknown as DomainNotificationType,
          link: notification.link ?? undefined,
        }),
    );
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponseDto> {
    this.logger.debug("Getting unread count", { userId });
    const count = await this.notificationRepo.countUnreadByUserId(userId);
    return new UnreadCountResponseDto(count);
  }

  async markAsRead(userId: string, id: string): Promise<NotificationResponseDto> {
    this.logger.debug("Marking notification as read", { id, userId });
    const existing = await this.notificationRepo.findByIdAndUserId(id, userId);
    if (!existing) throw new NotFoundException(t("errors.NOTIFICATION_NOT_FOUND"));

    const updated = await this.notificationRepo.markAsRead(userId, id);
    this.logger.log("Notification marked as read", { id });
    return new NotificationResponseDto({
      ...updated,
      type: updated.type as unknown as DomainNotificationType,
      link: updated.link ?? undefined,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    this.logger.debug("Marking all notifications as read", { userId });
    await this.notificationRepo.markAllAsRead(userId);
    this.logger.log("All notifications marked as read", { userId });
  }

  async deleteAll(userId: string): Promise<void> {
    this.logger.debug("Deleting all notifications", { userId });
    await this.notificationRepo.deleteAllByUserId(userId);
    this.logger.log("All notifications deleted", { userId });
  }

  async create(userId: string, type: PrismaNotificationType, text: string, link?: string): Promise<NotificationResponseDto> {
    this.logger.debug("Creating notification", { userId, type });
    const currentCount = await this.notificationRepo.countByUserId(userId);
    if (currentCount >= this.MAX_NOTIFICATIONS) {
      const toDelete = currentCount - this.MAX_NOTIFICATIONS + 1;
      await this.notificationRepo.deleteOldest(userId, toDelete);
    }

    const notification = await this.notificationRepo.create(userId, type, text, link);
    this.logger.log("Notification created", { userId, type });
    return new NotificationResponseDto({
      ...notification,
      type: notification.type as unknown as DomainNotificationType,
      link: notification.link ?? undefined,
    });
  }
}
