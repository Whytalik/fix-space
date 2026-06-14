import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class AuthResponseDto {
  @ApiProperty({ description: "Response message", example: "Operation completed successfully" })
  @Expose()
  message: string;

  @ApiProperty({ description: "JWT access token", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  @Expose()
  accessToken: string;

  @ApiProperty({ description: "JWT refresh token", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  @Expose()
  refreshToken: string;
}
