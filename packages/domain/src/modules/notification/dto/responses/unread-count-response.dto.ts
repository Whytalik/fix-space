import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UnreadCountResponseDto {
  @ApiProperty({ description: "Count of unread notifications", example: 5, required: true })
  @Expose()
  count: number;

  constructor(count: number) {
    this.count = count;
  }
}
