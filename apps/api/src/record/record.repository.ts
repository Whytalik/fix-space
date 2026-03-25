import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";

@Injectable()
export class RecordRepository {
  async findDatabaseByOwner(databaseId: string, userId: string) {
    return prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
      select: { id: true },
    });
  }

  async findPropertiesByDatabase(databaseId: string) {
    return prisma.property.findMany({ where: { databaseId } });
  }

  async findTemplateById(templateId: string, databaseId: string) {
    return prisma.template.findFirst({
      where: { id: templateId, databaseId },
      include: { values: true },
    });
  }

  async findDefaultTemplate(databaseId: string) {
    return (
      (await prisma.template.findFirst({
        where: { databaseId, isDefault: true },
        include: { values: true },
      })) ??
      (await prisma.template.findFirst({
        where: { databaseId },
        orderBy: { position: "asc" },
        include: { values: true },
      }))
    );
  }

  async findByIdWithOwner(id: string, userId: string) {
    return prisma.record.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
      include: { values: true, content: true },
    });
  }

  async findByIdForOwnerCheck(id: string, userId: string) {
    return prisma.record.findFirst({
      where: { id, database: { space: { ownerId: userId } } },
    });
  }

  async findAllByDatabase(databaseId: string, userId: string) {
    return prisma.record.findMany({
      where: { databaseId, database: { space: { ownerId: userId } } },
      include: { values: true, content: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPagedByDatabase(
    databaseId: string,
    userId: string,
    skip: number,
    take: number,
  ) {
    const where = { databaseId, database: { space: { ownerId: userId } } };
    return Promise.all([
      prisma.record.findMany({
        where,
        include: { values: true, content: true },
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
        values: { include: { property: { select: { type: true, position: true } } } },
        content: true,
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
        database: { select: { id: true, title: true } },
        values: { include: { property: { select: { type: true, name: true } } } },
      },
      take: 2000,
    });
  }

  async create(data: Prisma.RecordUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).record.create({ data });
  }

  async findUniqueOrThrowWithValues(id: string, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).record.findUniqueOrThrow({
      where: { id },
      include: { values: true, content: true },
    });
  }

  async update(id: string, data: Prisma.RecordUpdateInput) {
    return prisma.record.update({
      where: { id },
      data,
      include: { values: true, content: true },
    });
  }

  async delete(id: string) {
    return prisma.record.delete({ where: { id } });
  }

  async transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }
}
