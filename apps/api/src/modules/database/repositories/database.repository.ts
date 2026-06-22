import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class DatabaseRepository extends BaseRepository {
  async findDatabaseByOwner(databaseId: string, userId: string) {
    return prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
    });
  }

  async findByNameInSpace(name: string, spaceId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.findFirst({ where: { name, spaceId } });
  }

  async findUniqueSlug(baseSlug: string, spaceId: string, transaction?: Prisma.TransactionClient) {
    let slug = `${baseSlug}_copy`;
    let exists = await this.findByNameInSpace(slug, spaceId, transaction);
    let counter = 1;

    while (exists) {
      slug = `${baseSlug}_copy_${counter}`;
      exists = await this.findByNameInSpace(slug, spaceId, transaction);
      counter++;
    }

    return slug;
  }

  async findUniqueName(baseName: string, spaceId: string, transaction?: Prisma.TransactionClient) {
    let name = `${baseName} (Copy)`;
    let exists = await this.findByNameInSpace(name, spaceId, transaction);
    let counter = 1;

    while (exists) {
      name = `${baseName} (Copy ${counter})`;
      exists = await this.findByNameInSpace(name, spaceId, transaction);
      counter++;
    }

    return name;
  }

  async findById(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.findUnique({ where: { id } });
  }

  async findLastPosition(spaceId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.findFirst({
      where: { spaceId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
  }

  async findByIdForDuplicate(id: string) {
    return prisma.database.findUnique({
      where: { id },
      include: {
        properties: true,
        records: { include: { values: true } },
        templates: { include: { values: true } },
        automations: true,
        views: true,
      },
    });
  }

  async findByTypeForOwner(type: string, userId: string) {
    return prisma.database.findFirst({
      where: { type, space: { ownerId: userId } },
    });
  }

  async findByTypeInSpace(type: string, spaceId: string) {
    return prisma.database.findFirst({
      where: { type, spaceId },
    });
  }

  async findAllBySpace(spaceId: string, userId: string) {
    return prisma.database.findMany({ where: { spaceId, space: { ownerId: userId } } });
  }

  async findWithSpace(id: string) {
    return prisma.database.findUnique({
      where: { id },
      include: { space: { select: { ownerId: true } } },
    });
  }

  async create(data: Prisma.DatabaseUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.create({ data });
  }

  async update(id: string, data: Prisma.DatabaseUncheckedUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).database.delete({ where: { id } });
  }

  async exists(id: string) {
    const database = await prisma.database.findUnique({ where: { id }, select: { id: true } });
    return !!database;
  }
}
