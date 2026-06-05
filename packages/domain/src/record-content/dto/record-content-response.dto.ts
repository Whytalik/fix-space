import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RecordContentResponseDto {
  @Expose()
  id: string;

  @Expose()
  recordId: string;

  @Expose()
  content: Record<string, unknown>;

  @Expose()
  lastEditedAt: Date;

  constructor(partial: Partial<RecordContentResponseDto>) {
    Object.assign(this, partial);
  }
}
