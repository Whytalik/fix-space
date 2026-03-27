import { IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export enum SortField {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  PROPERTY = "property",
}

export class RecordSortDto {
  @IsEnum(SortField)
  field: SortField;

  @IsEnum(SortDirection)
  direction: SortDirection;

  @ValidateIf((o) => o.field === SortField.PROPERTY)
  @IsOptional()
  @IsString()
  propertyId?: string;
}
