import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsUUID, ValidateIf, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";
import { CreateSectionDto } from "./create-section.dto";
import { UpdateSectionDto } from "./update-section.dto";

export enum SectionOperationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export class SectionOperationDto {
  @ApiProperty({ description: "Operation type", enum: SectionOperationType, required: true })
  @IsEnum(SectionOperationType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  operation: SectionOperationType;

  @ApiProperty({ description: "Section ID", example: "uuid", required: false })
  @ValidateIf((item) => item.operation === SectionOperationType.UPDATE || item.operation === SectionOperationType.DELETE)
  @IsUUID("4", { message: i18nValidationMessage<I18nTranslations>("validation.IS_UUID") })
  id?: string;

  @ApiProperty({ description: "Create section data", required: false })
  @ValidateIf((item) => item.operation === SectionOperationType.CREATE)
  @ValidateNested()
  @Type(() => CreateSectionDto)
  create?: CreateSectionDto;

  @ApiProperty({ description: "Update section data", required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSectionDto)
  update?: UpdateSectionDto;
}
