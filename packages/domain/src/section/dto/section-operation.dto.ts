import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsUUID, ValidateIf, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";
import { CreateSectionDto } from "./create-section.dto";
import { UpdateSectionDto } from "./update-section.dto";

export enum SectionOperationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export class SectionOperationDto {
  @IsEnum(SectionOperationType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  operation: SectionOperationType;

  @ValidateIf((o) => o.operation === SectionOperationType.UPDATE || o.operation === SectionOperationType.DELETE)
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  id?: string;

  @ValidateIf((o) => o.operation === SectionOperationType.CREATE)
  @ValidateNested()
  @Type(() => CreateSectionDto)
  create?: CreateSectionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSectionDto)
  update?: UpdateSectionDto;
}
