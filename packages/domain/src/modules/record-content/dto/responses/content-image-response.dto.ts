import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ContentImageResponseDto {
  @ApiProperty({ description: "Uploaded image URL", example: "https://res.cloudinary.com/..." })
  @Expose()
  url: string;

  constructor(partial: Partial<ContentImageResponseDto>) {
    Object.assign(this, partial);
  }
}
