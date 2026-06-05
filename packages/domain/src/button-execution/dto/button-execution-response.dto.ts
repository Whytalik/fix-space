import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class ButtonExecutionResponseDto {
  @ApiProperty({ description: "Unique execution record identifier", example: "e7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  id: string;

  @ApiProperty({ description: "Related database record identifier", example: "r7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  recordId: string;

  @ApiProperty({ description: "Button property identifier", example: "p7b3d8e0-5b9c-4a1d-9f3e-6b2c8a1d4e0f", required: true })
  @Expose()
  propertyId: string;

  @ApiProperty({ description: "Execution timestamp", required: true })
  @Expose()
  executedAt: Date;

  constructor(partial: Partial<ButtonExecutionResponseDto>) {
    Object.assign(this, partial);
  }
}
