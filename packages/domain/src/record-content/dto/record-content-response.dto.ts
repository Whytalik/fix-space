import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RecordContentResponseDto {
  @Expose()
  id: string;

  @Expose()
  recordId: string;

  @Expose()
  lastEditedAt: Date;

  @Expose()
  config?: unknown;

  constructor(partial: Partial<RecordContentResponseDto>) {
    Object.assign(this, partial);
  }
}
