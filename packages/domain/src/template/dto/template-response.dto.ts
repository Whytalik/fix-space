import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { TemplatePropertyValueResponseDto } from "../../template-property-value/dto/template-property-value-response.dto";

@Exclude()
export class TemplateResponseDto {
  @ApiProperty({ description: "ID", example: "uuid", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Database ID", example: "uuid", required: true })
  @Expose()
  databaseId: string;

  @ApiProperty({ description: "Template name", example: "My Template", required: true })
  @Expose()
  name: string;

  @ApiProperty({ description: "Template description", example: "Description text", required: true, nullable: true })
  @Expose()
  description: string | null;

  @ApiProperty({ description: "Template icon", example: "icon-name", required: true, nullable: true })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Name pattern", example: "Pattern-{num}", required: true, nullable: true })
  @Expose()
  namePattern: string | null;

  @ApiProperty({ description: "Content", required: true })
  @Expose()
  content: unknown;

  @ApiProperty({ description: "Is default template", example: false, required: true })
  @Expose()
  isDefault: boolean;

  @ApiProperty({ description: "Position", example: 0, required: true })
  @Expose()
  position: number;

  @ApiProperty({ description: "Created at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Updated at", example: "2024-01-01T00:00:00.000Z", required: true })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: "Config", required: false })
  @Expose()
  config?: unknown;

  @ApiProperty({ description: "Template values", required: false })
  @Expose()
  @Type(() => TemplatePropertyValueResponseDto)
  values?: TemplatePropertyValueResponseDto[];

  constructor(partial: Partial<TemplateResponseDto>) {
    Object.assign(this, partial);
  }
}
