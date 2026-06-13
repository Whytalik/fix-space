import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class SpaceRepository extends BaseRepository {
  async findAll(ownerId: string, include?: Prisma.SpaceInclude) {
    return prisma.space.findMany({ where: { ownerId }, include });
  }

  findOne<T extends Prisma.SpaceInclude>(
    id: string,
    include?: T,
    transaction?: Prisma.TransactionClient,
  ): Promise<Prisma.SpaceGetPayload<{ include: T }> | null> {
    return (transaction ?? prisma).space.findUnique({ where: { id }, include }) as any;
  }

  async findByIdForDuplicate(id: string) {
    return prisma.space.findUnique({
      where: { id },
      include: {
        sections: true,
        databases: {
          include: {
            properties: true,
            templates: { include: { values: true } },
            automations: true,
          },
        },
      },
    });
  }

  async findUniqueSpaceName(baseName: string, ownerId: string, transaction?: Prisma.TransactionClient): Promise<string> {
    let name = `${baseName} (Copy)`;
    let exists = await (transaction ?? prisma).space.findFirst({ where: { name, ownerId } });
    let counter = 1;

    while (exists) {
      name = `${baseName} (Copy ${counter})`;
      exists = await (transaction ?? prisma).space.findFirst({ where: { name, ownerId } });
      counter++;
    }

    return name;
  }

  async findUniqueSectionName(baseName: string, spaceId: string, transaction?: Prisma.TransactionClient): Promise<string> {
    let name = `${baseName} (Copy)`;
    let exists = await (transaction ?? prisma).section.findFirst({ where: { name, spaceId } });
    let counter = 1;

    while (exists) {
      name = `${baseName} (Copy ${counter})`;
      exists = await (transaction ?? prisma).section.findFirst({ where: { name, spaceId } });
      counter++;
    }

    return name;
  }

  async findOwner(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.findUnique({
      where: { id },
      select: { ownerId: true, isDefault: true },
    });
  }

  async count(ownerId: string, transaction?: Prisma.TransactionClient): Promise<number> {
    return (transaction ?? prisma).space.count({ where: { ownerId } });
  }

  async create(data: Prisma.SpaceUncheckedCreateInput, include?: Prisma.SpaceInclude, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.create({ data, include });
  }

  async update(id: string, data: Prisma.SpaceUpdateInput, include?: Prisma.SpaceInclude, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.update({ where: { id }, data, include });
  }

  async updateMany(where: Prisma.SpaceWhereInput, data: Prisma.SpaceUpdateManyMutationInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.updateMany({ where, data });
  }

  async delete(id: string) {
    return prisma.space.delete({ where: { id } });
  }
}
