import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { SectionOperationDto } from "../../section/dto/section-operation.dto";
import { CreateSpaceDto } from "./create-space.dto";

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => SectionOperationDto)
  sectionOperations?: SectionOperationDto[];
}
