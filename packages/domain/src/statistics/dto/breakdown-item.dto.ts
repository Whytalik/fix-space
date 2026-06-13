import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class BreakdownItemDto {
  @ApiProperty({ description: "Property value label", example: "Win" })
  @Expose()
  label: string;

  @ApiProperty({ description: "Number of trades with this value", example: 42 })
  @Expose()
  count: number;

  @ApiProperty({ description: "Win rate for this group (0–1)", example: 0.62 })
  @Expose()
  winRate: number;

  @ApiProperty({ description: "Average net P&L for this group", example: 125.5 })
  @Expose()
  avgPnl: number;

  @ApiProperty({ description: "Total net P&L for this group", example: 5271 })
  @Expose()
  totalPnl: number;
}

export class BreakdownGroupDto {
  @ApiProperty({ description: "Property name used for grouping", example: "Direction" })
  @Expose()
  propertyName: string;

  @ApiProperty({ description: "Breakdown items", type: [BreakdownItemDto] })
  @Expose()
  @Type(() => BreakdownItemDto)
  items: BreakdownItemDto[];
}
