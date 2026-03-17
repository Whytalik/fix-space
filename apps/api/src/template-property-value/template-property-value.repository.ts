import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";

@Injectable()
export class TemplatePropertyValueRepository {
  async findTemplateByOwner(templateId: string, userId: string) {
    return prisma.template.findFirst({
      where: { id: templateId, database: { space: { ownerId: userId } } },
    });
  }

  async findPropertyById(propertyId: string) {
    return prisma.property.findUnique({ where: { id: propertyId } });
  }

  async findByIdWithOwner(id: string, userId: string) {
    return prisma.templatePropertyValue.findFirst({
      where: { id, template: { database: { space: { ownerId: userId } } } },
      include: { property: true },
    });
  }

  async findAllByTemplate(templateId: string, userId: string) {
    return prisma.templatePropertyValue.findMany({
      where: { templateId, template: { database: { space: { ownerId: userId } } } },
      include: { property: true },
    });
  }

  async upsert(templateId: string, propertyId: string, value: Prisma.InputJsonValue) {
    return prisma.templatePropertyValue.upsert({
      where: { templateId_propertyId: { templateId, propertyId } },
      update: { value },
      create: { templateId, propertyId, value },
    });
  }

  async update(id: string, data: Prisma.TemplatePropertyValueUpdateInput) {
    return prisma.templatePropertyValue.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.templatePropertyValue.delete({ where: { id } });
  }
}
