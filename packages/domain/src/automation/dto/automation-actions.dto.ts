import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { I18nTranslations } from "../../generated/i18n.generated";

export enum AutomationActionType {
  SET_FIELD_VALUE = "SET_FIELD_VALUE",
  CREATE_RECORD = "CREATE_RECORD",
  LINK_RECORDS = "LINK_RECORDS",
}

export abstract class AutomationActionBase {
  @IsEnum(AutomationActionType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: AutomationActionType;
}

export class SetFieldValueAction extends AutomationActionBase {
  type: AutomationActionType.SET_FIELD_VALUE = AutomationActionType.SET_FIELD_VALUE;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  value: unknown;
}

export class CreateRecordAction extends AutomationActionBase {
  type: AutomationActionType.CREATE_RECORD = AutomationActionType.CREATE_RECORD;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  @IsOptional()
  values?: Record<string, unknown>;
}

export class LinkRecordsAction extends AutomationActionBase {
  type: AutomationActionType.LINK_RECORDS = AutomationActionType.LINK_RECORDS;

  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  filters: Record<string, unknown>;
}

export type AutomationAction = SetFieldValueAction | CreateRecordAction | LinkRecordsAction;
