import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "@/generated/i18n.generated";

export type VisibilityOperator = "EQUALS" | "NOT_EQUALS" | "IN" | "NOT_IN" | "CONTAINS" | "EXISTS" | "NOT_EXISTS";

const VISIBILITY_OPERATORS: VisibilityOperator[] = ["EQUALS", "NOT_EQUALS", "IN", "NOT_IN", "CONTAINS", "EXISTS", "NOT_EXISTS"];

export class VisibilityConditionDto {
  @ApiProperty({ description: "Property name this condition depends on", example: "status" })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  dependsOnPropertyName: string;

  @ApiProperty({
    enum: VISIBILITY_OPERATORS,
    description: "Visibility comparison operator",
    example: "EQUALS",
  })
  @IsEnum(VISIBILITY_OPERATORS, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  operator: VisibilityOperator;

  @ApiProperty({ description: "Value to compare against", required: false })
  @IsOptional()
  value?: unknown;
}
