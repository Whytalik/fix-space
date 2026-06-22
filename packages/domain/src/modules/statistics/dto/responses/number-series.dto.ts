import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

import { ChartPointDto } from "./chart-point.dto";

export class NumberSeriesDto {
  @ApiProperty({ description: "Property name", example: "Risk %" })
  @Expose()
  propertyName: string;

  @ApiProperty({ description: "Time series of average values", type: [ChartPointDto] })
  @Expose()
  @Type(() => ChartPointDto)
  points: ChartPointDto[];
}
