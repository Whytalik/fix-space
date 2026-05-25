import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ContentBlockResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  name: string;

  @Expose()
  content: unknown;

  @Expose()
  isSystem: boolean;

  @Expose()
  isVisible: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ContentBlockResponseDto>) {
    Object.assign(this, partial);
  }
}
