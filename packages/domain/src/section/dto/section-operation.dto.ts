import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsUUID, ValidateIf, ValidateNested } from "class-validator";
import { CreateSectionDto } from "./create-section.dto";
import { UpdateSectionDto } from "./update-section.dto";

export enum SectionOperationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export class SectionOperationDto {
  @IsEnum(SectionOperationType, {
    message: "operation must be CREATE, UPDATE, or DELETE",
  })
  operation: SectionOperationType;

  @ValidateIf((o) => o.operation === SectionOperationType.UPDATE || o.operation === SectionOperationType.DELETE)
  @IsUUID("4", {
    message: "id must be a valid UUID",
  })
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
