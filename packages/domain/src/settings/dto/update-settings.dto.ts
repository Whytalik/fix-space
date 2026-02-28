import { IsNotEmpty, IsObject } from "class-validator";

export class UpdateSettingsDto {
  @IsNotEmpty({
    message: "Key is required",
  })
  key: string;

  @IsObject({
    message: "Value must be an object",
  })
  @IsNotEmpty({
    message: "Value is required",
  })
  value: Record<string, unknown>;
}
