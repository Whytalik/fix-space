import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

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
      include: { values: true },
    });
  }

  async findAllByDatabase(databaseId: string, userId: string) {
    return prisma.record.findMany({
      where: { databaseId, database: { space: { ownerId: userId } } },
      include: { values: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPagedByDatabase(databaseId: string, userId: string, skip: number, take: number) {
    const where = { databaseId, database: { space: { ownerId: userId } } };
    return Promise.all([
      prisma.record.findMany({
        where,
        include: { values: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.record.count({ where }),
    ]);
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
            title: true,
            section: { select: { name: true } },
          },
        },
        values: { include: { property: { select: { type: true, name: true } } } },
        content: { select: { content: true } },
      },
      take: 2000,
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

  async update(id: string, data: Prisma.RecordUpdateInput) {
    return prisma.record.update({
      where: { id },
      data,
      include: { values: true },
    });
  }

  async delete(id: string) {
    return prisma.record.delete({ where: { id } });
  }
}
