import { IsBoolean, IsObject, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";
import { ContentSchema } from "../types/content-schema.types";

export class UpdateRecordContentDto {
  @ApiProperty({
    description: "Record content data",
    example: { rows: [] },
    required: true,
  })
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  content: ContentSchema;

  @ApiProperty({
    description: "Whether to force a snapshot creation",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  forceSnapshot?: boolean;
}
