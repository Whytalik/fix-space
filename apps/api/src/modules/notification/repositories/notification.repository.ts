import { Injectable } from "@nestjs/common";
import { NotificationType, Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class NotificationRepository extends BaseRepository {
  async findAllByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async countUnreadByUserId(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string, transaction?: Prisma.TransactionClient) {
    await (transaction ?? prisma).notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(userId: string, type: NotificationType, text: string, link?: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).notification.create({
      data: { userId, type, text, link },
    });
  }

  async deleteOldest(userId: string, count: number, transaction?: Prisma.TransactionClient) {
    const oldest = await (transaction ?? prisma).notification.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: count,
      select: { id: true },
    });

    const notificationIds = oldest.map((notification) => notification.id);
    await (transaction ?? prisma).notification.deleteMany({
      where: { id: { in: notificationIds } },
    });
  }

  async countByUserId(userId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).notification.count({
      where: { userId },
    });
  }

  async deleteAllByUserId(userId: string, transaction?: Prisma.TransactionClient) {
    await (transaction ?? prisma).notification.deleteMany({
      where: { userId },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.notification.findUnique({
      where: { id, userId },
    });
  }
}
