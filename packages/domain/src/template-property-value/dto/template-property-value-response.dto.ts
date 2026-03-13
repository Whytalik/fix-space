import { Exclude, Expose } from "class-transformer";

@Exclude()
export class TemplatePropertyValueResponseDto {
  @Expose()
  id: string;

  @Expose()
  templateId: string;

  @Expose()
  propertyId: string;

  @Expose()
  value?: unknown;

  constructor(partial: Partial<TemplatePropertyValueResponseDto>) {
    Object.assign(this, partial);
  }
}
