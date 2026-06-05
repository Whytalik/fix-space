import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";

export enum AutomationActionType {
  SET_FIELD_VALUE = "SET_FIELD_VALUE",
  CREATE_RECORD = "CREATE_RECORD",
  LINK_RECORDS = "LINK_RECORDS",
}

export abstract class AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.SET_FIELD_VALUE, required: true })
  @IsEnum(AutomationActionType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: AutomationActionType;
}

export class SetFieldValueAction extends AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.SET_FIELD_VALUE, required: true })
  type: AutomationActionType.SET_FIELD_VALUE = AutomationActionType.SET_FIELD_VALUE;

  @ApiProperty({ description: "Field property ID", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @ApiProperty({ description: "Field value", example: "new value", required: true })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  value: unknown;
}

export class CreateRecordAction extends AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.CREATE_RECORD, required: true })
  type: AutomationActionType.CREATE_RECORD = AutomationActionType.CREATE_RECORD;

  @ApiProperty({ description: "Target database ID", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @ApiProperty({ description: "Field values for new record", example: {}, required: false })
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  @IsOptional()
  values?: Record<string, unknown>;
}

export class LinkRecordsAction extends AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.LINK_RECORDS, required: true })
  type: AutomationActionType.LINK_RECORDS = AutomationActionType.LINK_RECORDS;

  @ApiProperty({ description: "Link property ID", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @ApiProperty({ description: "Record filters for linking", example: {}, required: true })
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  filters: Record<string, unknown>;
}

export type AutomationAction = SetFieldValueAction | CreateRecordAction | LinkRecordsAction;
