import { Injectable } from "@nestjs/common";
import { IntegrationService, Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class IntegrationConnectionRepository extends BaseRepository {
  async findAllByUser(userId: string) {
    return prisma.integrationConnection.findMany({
      where: { userId },
      include: { space: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.integrationConnection.findUnique({ where: { id } });
  }

  async findByOwner(id: string, userId: string) {
    return prisma.integrationConnection.findFirst({
      where: { id, userId },
      include: { space: { select: { id: true, name: true } } },
    });
  }

  async countBySpaceAndService(spaceId: string, service: IntegrationService) {
    return prisma.integrationConnection.count({ where: { spaceId, service } });
  }

  async create(data: Prisma.IntegrationConnectionUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).integrationConnection.create({ data });
  }

  async update(id: string, data: Prisma.IntegrationConnectionUncheckedUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).integrationConnection.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).integrationConnection.delete({ where: { id } });
  }
}
