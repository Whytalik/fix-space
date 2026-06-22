import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class PropertyValueRepository extends BaseRepository {
  async findById(id: string) {
    return prisma.propertyValue.findUnique({
      where: { id },
      include: { property: true },
    });
  }

  async findAllByRecord(recordId: string, userId: string) {
    return prisma.propertyValue.findMany({
      where: { recordId, record: { database: { space: { ownerId: userId } } } },
      include: { property: true },
    });
  }

  async findByRecordAndProperty(recordId: string, propertyId: string) {
    return prisma.propertyValue.findUnique({
      where: { recordId_propertyId: { recordId, propertyId } },
    });
  }

  async upsert(
    recordId: string,
    propertyId: string,
    value: Prisma.InputJsonValue,
    computed: boolean,
    transaction?: Prisma.TransactionClient,
  ) {
    return (transaction ?? prisma).propertyValue.upsert({
      where: { recordId_propertyId: { recordId, propertyId } },
      update: { value, computed },
      create: { recordId, propertyId, value, computed },
    });
  }

  async update(id: string, data: Prisma.PropertyValueUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).propertyValue.update({ where: { id }, data });
  }

  async updateByCompositeKey(
    recordId: string,
    propertyId: string,
    data: Prisma.PropertyValueUpdateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    return (transaction ?? prisma).propertyValue.update({
      where: { recordId_propertyId: { recordId, propertyId } },
      data,
    });
  }

  async createMany(data: Prisma.PropertyValueCreateManyInput[], transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).propertyValue.createMany({ data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).propertyValue.delete({ where: { id } });
  }
}
