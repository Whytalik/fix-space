import { Injectable } from "@nestjs/common";
import { prisma, type Notification, type NotificationType } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class NotificationRepository extends BaseRepository {
  async findAllByUserId(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(userId: string, type: NotificationType, text: string, link?: string): Promise<Notification> {
    return prisma.notification.create({
      data: { userId, type, text, link },
    });
  }

  async deleteOldest(userId: string, count: number): Promise<void> {
    const oldest = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: count,
      select: { id: true },
    });

    const notificationIds = oldest.map((notification) => notification.id);
    await prisma.notification.deleteMany({
      where: { id: { in: notificationIds } },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: { userId },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id, userId },
    });
  }
}
