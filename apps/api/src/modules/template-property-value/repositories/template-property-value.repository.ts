import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";

@Injectable()
export class TemplatePropertyValueRepository extends BaseRepository {
  async findById(id: string) {
    return prisma.templatePropertyValue.findUnique({
      where: { id },
      include: { property: true },
    });
  }

  async findAllByTemplate(templateId: string, userId: string) {
    return prisma.templatePropertyValue.findMany({
      where: { templateId, template: { database: { space: { ownerId: userId } } } },
      include: { property: true },
    });
  }

  async upsert(templateId: string, propertyId: string, value: Prisma.InputJsonValue, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).templatePropertyValue.upsert({
      where: { templateId_propertyId: { templateId, propertyId } },
      update: { value },
      create: { templateId, propertyId, value },
    });
  }

  async update(id: string, data: Prisma.TemplatePropertyValueUpdateInput, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).templatePropertyValue.update({ where: { id }, data });
  }

  async delete(id: string, transaction?: Prisma.TransactionClient) {
    return (transaction ?? prisma).templatePropertyValue.delete({ where: { id } });
  }
}
