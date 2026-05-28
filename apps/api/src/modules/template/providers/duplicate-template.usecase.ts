import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { TemplateResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { TemplateRepository } from "../template.repository";

@Injectable()
export class DuplicateTemplateUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly templateRepo: TemplateRepository,
  ) {
    this.logger.setContext(DuplicateTemplateUseCase.name);
  }

  async execute(id: string, userId: string): Promise<TemplateResponseDto> {
    this.logger.debug("Duplicating template", { id });

    const source = await this.templateRepo.findByIdWithValues(id, userId);

    if (!source) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const result = await this.templateRepo.transaction(async (tx) => {
      const copy = await this.templateRepo.create(
        {
          databaseId: source.databaseId,
          name: `${source.name} Copy`,
          description: source.description,
          icon: source.icon,
          isDefault: false,
          position: source.position,
        },
        tx,
      );

      for (const tpv of source.values) {
        await tx.templatePropertyValue.create({
          data: {
            templateId: copy.id,
            propertyId: tpv.propertyId,
            value: tpv.value as Prisma.InputJsonValue,
          },
        });
      }

      return this.templateRepo.findUniqueOrThrowWithValues(copy.id, tx);
    });

    this.logger.log("Template duplicated", { sourceId: id, copyId: result.id });
    return new TemplateResponseDto(result);
  }
}
