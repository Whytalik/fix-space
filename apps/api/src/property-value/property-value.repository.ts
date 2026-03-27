import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";

@Injectable()
export class PropertyValueRepository {
  async findRecordByOwner(recordId: string, userId: string) {
    return prisma.record.findFirst({
      where: { id: recordId, database: { space: { ownerId: userId } } },
    });
  }

  async findPropertyById(propertyId: string) {
    return prisma.property.findUnique({ where: { id: propertyId } });
  }

  async findByIdWithOwner(id: string, userId: string) {
    return prisma.propertyValue.findFirst({
      where: { id, record: { database: { space: { ownerId: userId } } } },
      include: { property: true },
    });
  }

  async findAllByRecord(recordId: string, userId: string) {
    return prisma.propertyValue.findMany({
      where: { recordId, record: { database: { space: { ownerId: userId } } } },
      include: { property: true },
    });
  }

  async upsert(
    recordId: string,
    propertyId: string,
    value: Prisma.InputJsonValue,
    computed: boolean,
  ) {
    return prisma.propertyValue.upsert({
      where: { recordId_propertyId: { recordId, propertyId } },
      update: { value, computed },
      create: { recordId, propertyId, value, computed },
    });
  }

  async update(id: string, data: Prisma.PropertyValueUpdateInput) {
    return prisma.propertyValue.update({ where: { id }, data });
  }

  async updateByCompositeKey(recordId: string, propertyId: string, data: Prisma.PropertyValueUpdateInput) {
    return prisma.propertyValue.update({
      where: { recordId_propertyId: { recordId, propertyId } },
      data,
    });
  }

  async createMany(data: Prisma.PropertyValueCreateManyInput[]) {
    return prisma.propertyValue.createMany({ data });
  }

  async delete(id: string) {
    return prisma.propertyValue.delete({ where: { id } });
  }
}
