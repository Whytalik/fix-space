import { Exclude, Expose, Type } from "class-transformer";
import { TemplatePropertyValueResponseDto } from "../../template-property-value/dto/template-property-value-response.dto";

@Exclude()
export class TemplateResponseDto {
  @Expose()
  id: string;

  @Expose()
  databaseId: string;

  @Expose()
  name: string;

  @Expose()
  description: string | null;

  @Expose()
  icon: string | null;

  @Expose()
  namePattern: string | null;

  @Expose()
  content: unknown;

  @Expose()
  isDefault: boolean;

  @Expose()
  position: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  config?: unknown;

  @Expose()
  @Type(() => TemplatePropertyValueResponseDto)
  values?: TemplatePropertyValueResponseDto[];

  constructor(partial: Partial<TemplateResponseDto>) {
    Object.assign(this, partial);
  }
}
