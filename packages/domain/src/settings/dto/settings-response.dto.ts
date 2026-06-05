import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export type JsonValue =
  | string
  | number
  | boolean
  | {
      [key: string]: JsonValue;
    }
  | JsonValue[]
  | null;

@Exclude()
export class SettingsResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "clx123..." })
  @Expose()
  id: string;

  @ApiProperty({ description: "User ID", example: "clx123..." })
  @Expose()
  userId: string;

  @ApiProperty({ description: "Setting key", example: "workspace.theme" })
  @Expose()
  key: string;

  @ApiProperty({ description: "Setting value", example: {} })
  @Expose()
  value: JsonValue;

  @ApiProperty({ description: "Setting category", example: "workspace" })
  @Expose()
  category: string;

  constructor(partial: Partial<SettingsResponseDto>) {
    Object.assign(this, partial);
  }
}
