import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { TemplateResponseDto } from "@fixspace/domain";
import { AppLogger } from "../../../common/logger/app-logger.service";
import { TemplateRepository } from "../repositories/template.repository";
import { generateUniqueName } from "../../../common/utils/generate-unique-name";

@Injectable()
export class DuplicateTemplateUseCase {
  constructor(
    private readonly logger: AppLogger,
    private readonly templateRepo: TemplateRepository,
  ) {
    this.logger.setContext(DuplicateTemplateUseCase.name);
  }

  async execute(id: string): Promise<TemplateResponseDto> {
    this.logger.debug("Duplicating template", { id });

    const source = await this.templateRepo.findByIdWithValues(id);

    if (!source) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    const result = await this.templateRepo.transaction(async (transaction) => {
      const copy = await this.templateRepo.create(
        {
          databaseId: source.databaseId,
          name: generateUniqueName(source.name),
          description: source.description,
          icon: source.icon,
          isDefault: false,
          position: source.position,
        },
        transaction,
      );

      for (const templatePropertyValue of source.values) {
        await transaction.templatePropertyValue.create({
          data: {
            templateId: copy.id,
            propertyId: templatePropertyValue.propertyId,
            value: templatePropertyValue.value as Prisma.InputJsonValue,
          },
        });
      }

      return this.templateRepo.findUniqueOrThrowWithValues(copy.id, transaction);
    });

    this.logger.log("Template duplicated", { sourceId: id, copyId: result.id });
    return new TemplateResponseDto(result);
  }
}
