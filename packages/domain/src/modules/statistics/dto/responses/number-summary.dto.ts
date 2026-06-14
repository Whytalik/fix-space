import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class NumberSummaryDto {
  @ApiProperty({ description: "Property name", example: "Risk %" })
  @Expose()
  propertyName: string;

  @ApiProperty({ description: "Sum of values", example: 12500 })
  @Expose()
  sum: number;

  @ApiProperty({ description: "Average value", example: 312.5 })
  @Expose()
  average: number;

  @ApiProperty({ description: "Number of records with this property", example: 40 })
  @Expose()
  count: number;
}
