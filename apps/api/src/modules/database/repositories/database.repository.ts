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

  async findUniqueSlug(baseSlug: string, spaceId: string, transaction?: Prisma.TransactionClient): Promise<string> {
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

  async findUniqueTitle(baseTitle: string, spaceId: string, transaction?: Prisma.TransactionClient): Promise<string> {
    let title = `${baseTitle} (Copy)`;
    let exists = await (transaction ?? prisma).database.findFirst({ where: { title, spaceId } });
    let counter = 1;

    while (exists) {
      title = `${baseTitle} (Copy ${counter})`;
      exists = await (transaction ?? prisma).database.findFirst({ where: { title, spaceId } });
      counter++;
    }

    return title;
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

  async exists(id: string): Promise<boolean> {
    const database = await prisma.database.findUnique({ where: { id }, select: { id: true } });
    return !!database;
  }
}
