import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: "Unique identifier", example: "clx123..." })
  @Expose()
  id: string;

  @ApiProperty({ description: "User email", example: "user@example.com" })
  @Expose()
  email: string;

  @ApiProperty({ description: "Username", example: "john_doe" })
  @Expose()
  username: string;

  @ApiProperty({ description: "User icon URL", example: "https://example.com/icon.png", nullable: true })
  @Expose()
  icon: string | null;

  @ApiProperty({ description: "Email verification status", example: true })
  @Expose()
  isVerified: boolean;

  @ApiProperty({ description: "Account creation timestamp", example: "2024-01-01T00:00:00.000Z" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "Whether the user has a local password set", example: true })
  @Expose()
  hasPassword: boolean;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
