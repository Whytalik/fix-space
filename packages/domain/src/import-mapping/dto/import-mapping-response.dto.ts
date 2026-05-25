import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ImportMappingResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  sourceType: string;

  @Expose()
  mappingRules: Record<string, string>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ImportMappingResponseDto>) {
    Object.assign(this, partial);
  }
}
