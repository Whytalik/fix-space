import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class MT5TradeDto {
  @ApiProperty()
  @IsString()
  sourcePositionId: string;

  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  direction: string;

  @ApiProperty()
  @IsNumber()
  entryPrice: number;

  @ApiProperty()
  @IsNumber()
  exitPrice: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  grossPnL: number;

  @ApiProperty()
  @IsNumber()
  fees: number;

  @ApiProperty()
  @IsNumber()
  netPnL: number;

  @ApiProperty()
  @IsDateString()
  openTime: string;

  @ApiProperty()
  @IsDateString()
  closeTime: string;

  @ApiProperty()
  @IsString()
  currency: string;
}

export class MT5WebhookDto {
  @ApiProperty({ description: "Connection ID to sync trades for" })
  @IsString()
  connectionId: string;

  @ApiProperty({ type: [MT5TradeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MT5TradeDto)
  trades: MT5TradeDto[];
}
