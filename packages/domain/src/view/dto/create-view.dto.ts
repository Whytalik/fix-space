import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { ApiProperty } from "@nestjs/swagger";
import { I18nTranslations } from "../../generated/i18n.generated";
import { FilterLogic, RecordFilterDto } from "../../record/dto/record-filter.dto";
import { RecordSortDto } from "../../record/dto/record-sort.dto";
import { SummaryMetric } from "../../record/dto/record-summary.enums";

export class CreateViewDto {
  @ApiProperty({ description: "Database ID", example: "uuid", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  databaseId: string;

  @ApiProperty({ description: "View name", example: "Grid View", required: true })
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.IS_NOT_EMPTY") })
  @MaxLength(255, { message: i18nValidationMessage<I18nTranslations>("validation.MAX_LENGTH") })
  name: string;

  @ApiProperty({ description: "View icon", example: "icon:LayoutGrid", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  icon?: string;

  @ApiProperty({ description: "Is view locked", example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  isLocked?: boolean;

  @ApiProperty({ description: "Page size", example: 50, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  pageSize?: number;

  @ApiProperty({ description: "Maximum number of records", example: 50, required: false })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>("validation.IS_INT") })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>("validation.MIN") })
  recordLimit?: number;

  @ApiProperty({ description: "Whether to use default template", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  useDefaultTemplate?: boolean;

  @ApiProperty({ description: "Default template ID", example: "uuid", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  defaultTemplateId?: string;

  @ApiProperty({ description: "Filters", required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => RecordFilterDto)
  filters?: RecordFilterDto[];

  @ApiProperty({ enum: FilterLogic, description: "Filter logic", required: false })
  @IsOptional()
  @IsEnum(FilterLogic, { message: i18nValidationMessage<I18nTranslations>("validation.IS_ENUM") })
  filterLogic?: FilterLogic;

  @ApiProperty({ description: "Sort configuration", required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @ValidateNested({ each: true })
  @Type(() => RecordSortDto)
  sort?: RecordSortDto[];

  @ApiProperty({ description: "Group by property", example: "status", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  groupBy?: string;

  @ApiProperty({ description: "Hidden columns", example: ["col1", "col2"], required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  hiddenColumns?: string[];

  @ApiProperty({ description: "Column widths", example: { col1: 200 }, required: false })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  columnWidths?: Record<string, number>;

  @ApiProperty({ description: "Column summaries", example: {}, required: false })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  columnSummaries?: Record<string, SummaryMetric>;

  @ApiProperty({ description: "Group colors", example: {}, required: false })
  @IsOptional()
  @IsObject({ message: i18nValidationMessage<I18nTranslations>("validation.IS_OBJECT") })
  groupColors?: Record<string, string>;

  @ApiProperty({ description: "Hidden groups", example: [], required: false })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>("validation.IS_ARRAY") })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  hiddenGroups?: string[];

  @ApiProperty({ description: "Text wrap enabled", example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>("validation.IS_BOOLEAN") })
  textWrap?: boolean;

  @ApiProperty({ description: "Search query", example: "search term", required: false })
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>("validation.IS_STRING") })
  searchQuery?: string;
}
