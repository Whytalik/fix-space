import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, prisma } from "@nucleus/database";
import { TemplateResponseDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";

@Injectable()
export class DuplicateTemplateUseCase {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(DuplicateTemplateUseCase.name);
  }

  async execute(id: string, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Duplicating template", { id });

    const source = await prisma.template.findFirst({
      where: {
        id,
        database: { space: { ownerId: userId } },
      },
      include: { values: true },
    });

    if (!source) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const result = await prisma.$transaction(async (tx) => {
      const copy = await tx.template.create({
        data: {
          databaseId: source.databaseId,
          name: `${source.name} Copy`,
          description: source.description,
          icon: source.icon,
          isDefault: false,
          position: source.position,
        },
      });

      for (const tpv of source.values) {
        await tx.templatePropertyValue.create({
          data: {
            templateId: copy.id,
            propertyId: tpv.propertyId,
            value: tpv.value as Prisma.InputJsonValue,
          },
        });
      }

      return tx.template.findUniqueOrThrow({
        where: { id: copy.id },
        include: { values: true },
      });
    });

    this.logger.log("Template duplicated", { sourceId: id, copyId: result.id });
    return new TemplateResponseDto(result);
  }
}
