import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class TemplateRepository extends BaseRepository {
  async findDatabaseByOwner(databaseId: string, userId: string) {
    return prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
    });
  }

  async findPropertiesByDatabase(databaseId: string) {
    return prisma.property.findMany({ where: { databaseId } });
  }

  async findById(id: string) {
    return prisma.template.findUnique({ where: { id } });
  }

  async findByIdWithValues(id: string) {
    return prisma.template.findUnique({
      where: { id },
      include: { values: true },
    });
  }

  async findAllByDatabase(databaseId: string, userId: string) {
    return prisma.template.findMany({
      where: { databaseId, database: { space: { ownerId: userId } } },
      include: { values: true },
      orderBy: { position: "asc" },
    });
  }

  async count(databaseId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.count({ where: { databaseId } });
  }

  async create(data: Prisma.TemplateUncheckedCreateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.create({ data });
  }

  async findUniqueOrThrowWithValues(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.findUniqueOrThrow({
      where: { id },
      include: { values: true },
    });
  }

  async update(id: string, data: Prisma.TemplateUpdateInput, include?: Prisma.TemplateInclude, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.update({ where: { id }, data, include });
  }

  async updateMany(where: Prisma.TemplateWhereInput, data: Prisma.TemplateUpdateManyMutationInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.updateMany({ where, data });
  }

  async findFirstInDatabase(databaseId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.findFirst({
      where: { databaseId },
      orderBy: { position: "asc" },
    });
  }

  async findDefaultInDatabase(databaseId: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.findFirst({
      where: { databaseId, isDefault: true },
    });
  }

  async delete(id: string, include?: Prisma.TemplateInclude, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).template.delete({ where: { id }, include });
  }
}
