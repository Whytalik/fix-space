import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "../../../common/utils/base.repository";

@Injectable()
export class SpaceRepository extends BaseRepository {
  async findAll(ownerId: string, include?: Prisma.SpaceInclude) {
    return prisma.space.findMany({ where: { ownerId }, include });
  }

  async findOne(id: string, include?: Prisma.SpaceInclude) {
    return prisma.space.findUnique({ where: { id }, include });
  }

  async findByIdForDuplicate(id: string) {
    return prisma.space.findUnique({
      where: { id },
      include: {
        sections: true,
        databases: {
          include: {
            properties: true,
            records: { include: { values: true, content: true } },
            templates: { include: { values: true } },
          },
        },
      },
    });
  }

  async findOwner(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).space.findUnique({
      where: { id },
      select: { ownerId: true, isDefault: true },
    });
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
