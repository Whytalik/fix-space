import { ApiProperty } from "@nestjs/swagger";

export class IntegrationTradeDto {
  @ApiProperty() sourcePositionId: string;
  @ApiProperty() symbol: string;
  @ApiProperty({ enum: ["BUY", "SELL"] }) direction: "BUY" | "SELL";
  @ApiProperty() entryPrice: number;
  @ApiProperty() exitPrice: number;
  @ApiProperty() quantity: number;
  @ApiProperty() grossPnL: number;
  @ApiProperty() fees: number;
  @ApiProperty() netPnL: number;
  @ApiProperty() openTime: string;
  @ApiProperty() closeTime: string;
  @ApiProperty() currency: string;
  @ApiProperty() alreadyImported: boolean;
  @ApiProperty({ required: false }) stopLoss?: number;
  @ApiProperty({ required: false }) takeProfit?: number;
}

export class PreviewTradesResponseDto {
  @ApiProperty({ type: [IntegrationTradeDto] }) trades: IntegrationTradeDto[];
  @ApiProperty({ nullable: true }) journalDatabaseId: string | null;
}
