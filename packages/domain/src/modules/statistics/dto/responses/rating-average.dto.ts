import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class RatingAverageDto {
  @ApiProperty({ description: "Property name", example: "Sleep Quality" })
  @Expose()
  propertyName: string;

  @ApiProperty({ description: "Average rating value", example: 3.5 })
  @Expose()
  average: number;

  @ApiProperty({ description: "Number of ratings", example: 12 })
  @Expose()
  count: number;
}
