import { IsObject } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";

export class UpdateRecordContentDto {
  @ApiProperty({ description: "Record content data", example: { fieldId: "value" }, required: true })
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  content: Record<string, unknown>;
}
