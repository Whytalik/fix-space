import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PropertyValueResponseDto {
  @ApiProperty({ description: "Property value ID" })
  @Expose()
  id: string;

  @ApiProperty({ description: "Record ID" })
  @Expose()
  recordId: string;

  @ApiProperty({ description: "Property ID" })
  @Expose()
  propertyId: string;

  @ApiProperty({ description: "Property value", required: false })
  @Expose()
  value?: unknown;

  @ApiProperty({ description: "Whether the value is computed", example: false })
  @Expose()
  computed: boolean;

  @ApiProperty({ description: "Property display name", example: "Status", required: false })
  @Expose()
  propertyName?: string;

  constructor(partial: Partial<PropertyValueResponseDto>) {
    Object.assign(this, partial);
  }
}
