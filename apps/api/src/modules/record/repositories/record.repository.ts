import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

const valuesWithPropertyName = {
  include: { property: { select: { name: true } } },
} as const;

@Injectable()
export class RecordRepository extends BaseRepository {
  async findByIdWithOwner(id: string, userId: string) {
    return prisma.record.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
    });
  }

  async findManyByDatabase(databaseId: string) {
    return prisma.record.findMany({
      where: { databaseId },
      include: { values: true },
    });
  }

  async countByDatabase(databaseId: string) {
    return prisma.record.count({ where: { databaseId } });
  }

  async findById(id: string) {
    return prisma.record.findUnique({
      where: { id },
      include: { values: valuesWithPropertyName },
    });
  }

  async findAllByDatabase(databaseId: string, userId: string) {
    return prisma.record.findMany({
      where: { databaseId, database: { space: { ownerId: userId } } },
      include: { values: valuesWithPropertyName },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPagedByDatabase(databaseId: string, userId: string, skip: number, take: number) {
    const where = { databaseId, database: { space: { ownerId: userId } } };
    return Promise.all([
      prisma.record.findMany({
        where,
        include: { values: valuesWithPropertyName },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.record.count({ where }),
    ]);
  }

  async findBySourceIntegration(connectionId: string, sourcePositionIds: string[]) {
    return prisma.record.findMany({
      where: {
        sourceIntegrationId: connectionId,
        sourcePositionId: { in: sourcePositionIds },
      },
      select: { sourcePositionId: true },
    });
  }

  async findWithFilters(
    databaseId: string,
    userId: string,
    where?: Prisma.RecordWhereInput,
    orderBy?: Prisma.RecordOrderByWithRelationInput[],
  ) {
    return prisma.record.findMany({
      where: {
        databaseId,
        database: { space: { ownerId: userId } },
        ...where,
      },
      include: {
        values: { include: { property: { select: { type: true, position: true, name: true } } } },
      },
      ...(orderBy ? { orderBy } : {}),
    });
  }

  async findAllBySpaceForSearch(spaceId: string, userId: string) {
    return prisma.record.findMany({
      where: {
        database: {
          spaceId,
          space: { ownerId: userId },
        },
      },
      include: {
        database: {
          select: {
            id: true,
            name: true,
            section: { select: { name: true } },
          },
        },
        values: { include: { property: { select: { type: true, name: true } } } },
        content: { select: { content: true } },
      },
      take: 2000,
    });
  }

  async findManyWithValuesBySourceIntegration(connectionId: string) {
    return prisma.record.findMany({
      where: {
        sourceIntegrationId: connectionId,
      },
      include: {
        values: {
          include: {
            property: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.RecordUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).record.create({ data });
  }

  async findUniqueOrThrowWithValues(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).record.findUniqueOrThrow({
      where: { id },
      include: { values: true },
    });
  }

  async update(id: string, data: Prisma.RecordUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).record.update({
      where: { id },
      data,
      include: { values: true },
    });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).record.delete({ where: { id } });
  }
}
