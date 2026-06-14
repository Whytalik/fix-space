import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class TemplatePropertyValueResponseDto {
  @ApiProperty({ description: "ID", example: "uuid", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Template ID", example: "uuid", required: true })
  @Expose()
  templateId: string;

  @ApiProperty({ description: "Property ID", example: "uuid", required: true })
  @Expose()
  propertyId: string;

  @ApiProperty({ description: "Value", required: false })
  @Expose()
  value?: unknown;

  constructor(partial: Partial<TemplatePropertyValueResponseDto>) {
    Object.assign(this, partial);
  }
}
