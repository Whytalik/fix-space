import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { SectionOperationDto } from "../../section/dto/section-operation.dto";

export class UpdateSpaceDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: "Space name must be at least 1 character" })
  @MaxLength(120, { message: "Space name must not exceed 120 characters" })
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionOperationDto)
  sectionOperations?: SectionOperationDto[];
}
