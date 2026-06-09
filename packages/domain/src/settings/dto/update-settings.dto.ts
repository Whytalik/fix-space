import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";
import { DatabaseSettings, RecordSettings, SectionSettings, SpaceSettings } from "../types";

export class UpdateSettingsDto {
  @ApiProperty({ description: "Setting category", example: "workspace", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  category?: string;

  @ApiProperty({ description: "Setting key", example: "workspace.theme", required: true })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  key: string;

  @ApiProperty({ description: "Setting value object", example: {}, required: true })
  @ValidateNested()
  @Type(() => Object, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "category",
      subTypes: [
        { value: SpaceSettings, name: "workspace" },
        { value: SectionSettings, name: "sections" },
        { value: DatabaseSettings, name: "databases" },
        { value: RecordSettings, name: "records" },
      ],
    },
  })
  value: SpaceSettings | SectionSettings | DatabaseSettings | RecordSettings | Record<string, unknown>;
}
