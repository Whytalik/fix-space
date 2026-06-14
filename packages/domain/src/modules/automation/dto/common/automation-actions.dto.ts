import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { I18nTranslations } from "@/generated/i18n.generated";
import { ValueType } from "./automation-value.dto";

export enum AutomationActionType {
  SET_FIELD_VALUE = "SET_FIELD_VALUE",
  CREATE_RECORD = "CREATE_RECORD",
  LINK_RECORDS = "LINK_RECORDS",
}

export enum AutomationFilterOperator {
  EQUALS = "equals",
  BETWEEN = "between",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",
}

export enum AutomationWriteMode {
  REPLACE = "replace",
  APPEND = "append",
}

export abstract class AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.SET_FIELD_VALUE, required: true })
  @IsEnum(AutomationActionType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  type: AutomationActionType;
}

export class FieldMappingDto {
  @ApiProperty({ description: "Target property ID in the new record", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  targetPropertyId: string;

  @ApiProperty({ description: "Value type", enum: ValueType, example: ValueType.FIXED, required: true })
  @IsEnum(ValueType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  valueType: ValueType;

  @ApiPropertyOptional({ description: "Fixed value (when valueType = FIXED)", example: "Win" })
  @IsOptional()
  value?: unknown;

  @ApiPropertyOptional({ description: "Source property ID (when valueType = FIELD_REF)", example: "clx123..." })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  fieldRef?: string;
}

export class AutomationFilterDto {
  @ApiProperty({ description: "Property ID to filter by", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @ApiProperty({ description: "Filter operator", enum: AutomationFilterOperator, example: AutomationFilterOperator.EQUALS, required: true })
  @IsEnum(AutomationFilterOperator, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  operator: AutomationFilterOperator;

  @ApiProperty({ description: "Value type", enum: ValueType, example: ValueType.FIELD_REF, required: true })
  @IsEnum(ValueType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  valueType: ValueType;

  @ApiPropertyOptional({ description: "Fixed value (when valueType = FIXED)", example: "Win" })
  @IsOptional()
  value?: unknown;

  @ApiPropertyOptional({ description: "Field reference for value or start of range (when valueType = FIELD_REF)", example: "clx123..." })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  fieldRef?: string;

  @ApiPropertyOptional({ description: "Field reference for end of range (for BETWEEN operator)", example: "clx456..." })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  fieldRefEnd?: string;
}

export class SetFieldValueAction extends AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.SET_FIELD_VALUE, required: true })
  type: AutomationActionType.SET_FIELD_VALUE = AutomationActionType.SET_FIELD_VALUE;

  @ApiProperty({ description: "Property ID to set", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @ApiProperty({ description: "Value type", enum: ValueType, example: ValueType.FIXED, required: true })
  @IsEnum(ValueType, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  valueType: ValueType;

  @ApiPropertyOptional({ description: "Fixed value (when valueType = FIXED)", example: "Win" })
  @IsOptional()
  value?: unknown;

  @ApiPropertyOptional({ description: "Source property ID (when valueType = FIELD_REF)", example: "clx123..." })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  fieldRef?: string;
}

export class CreateRecordAction extends AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.CREATE_RECORD, required: true })
  type: AutomationActionType.CREATE_RECORD = AutomationActionType.CREATE_RECORD;

  @ApiProperty({ description: "Target database ID", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @ApiProperty({ description: "Field value mappings for the new record", type: () => [FieldMappingDto], required: true })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => FieldMappingDto)
  fieldMappings: FieldMappingDto[];
}

export class LinkRecordsAction extends AutomationActionBase {
  @ApiProperty({ description: "Action type", enum: AutomationActionType, example: AutomationActionType.LINK_RECORDS, required: true })
  type: AutomationActionType.LINK_RECORDS = AutomationActionType.LINK_RECORDS;

  @ApiProperty({ description: "RELATION property ID to write linked records into", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  propertyId: string;

  @ApiProperty({ description: "Database ID to search records in", example: "clx123...", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  sourceDatabaseId: string;

  @ApiProperty({ description: "Filters to match records", type: () => [AutomationFilterDto], required: true })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => AutomationFilterDto)
  filters: AutomationFilterDto[];

  @ApiProperty({
    description: "Whether to replace or append found records",
    enum: AutomationWriteMode,
    example: AutomationWriteMode.REPLACE,
    required: true,
  })
  @IsEnum(AutomationWriteMode, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  writeMode: AutomationWriteMode;
}

export type AutomationAction = SetFieldValueAction | CreateRecordAction | LinkRecordsAction;
