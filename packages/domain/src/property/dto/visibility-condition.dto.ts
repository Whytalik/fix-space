import { ApiProperty } from "@nestjs/swagger";

export type VisibilityOperator = "EQUALS" | "NOT_EQUALS" | "IN" | "NOT_IN" | "CONTAINS" | "EXISTS" | "NOT_EXISTS";

export class VisibilityConditionDto {
  @ApiProperty({ description: "Property name this condition depends on", example: "status" })
  dependsOnPropertyName: string;

  @ApiProperty({
    enum: ["EQUALS", "NOT_EQUALS", "IN", "NOT_IN", "CONTAINS", "EXISTS", "NOT_EXISTS"] as VisibilityOperator[],
    description: "Visibility comparison operator",
    example: "EQUALS",
  })
  operator: VisibilityOperator;

  @ApiProperty({ description: "Value to compare against", required: false })
  value?: unknown;
}
