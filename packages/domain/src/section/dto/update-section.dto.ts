import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsString } from "class-validator";
import { CreateSectionDto } from "./create-section.dto";

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
