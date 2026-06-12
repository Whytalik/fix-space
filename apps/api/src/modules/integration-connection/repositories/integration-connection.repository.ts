import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "../../../common/utils/base.repository";
import { IntegrationService } from "@fixspace/domain";

@Injectable()
export class IntegrationConnectionRepository extends BaseRepository {
  findAllByUser(userId: string) {
    return prisma.integrationConnection.findMany({
      where: { userId },
      include: { space: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  findById(id: string) {
    return prisma.integrationConnection.findUnique({ where: { id } });
  }

  findByOwner(id: string, userId: string) {
    return prisma.integrationConnection.findFirst({
      where: { id, userId },
      include: { space: { select: { id: true, name: true } } },
    });
  }

  countBySpaceAndService(spaceId: string, service: IntegrationService) {
    return prisma.integrationConnection.count({ where: { spaceId, service } });
  }

  create(data: Prisma.IntegrationConnectionUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).integrationConnection.create({ data });
  }

  update(id: string, data: Prisma.IntegrationConnectionUncheckedUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).integrationConnection.update({ where: { id }, data });
  }

  delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).integrationConnection.delete({ where: { id } });
  }
}
