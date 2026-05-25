import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RecordContentSnapshotResponseDto {
  @Expose()
  id: string;

  @Expose()
  recordContentId: string;

  @Expose()
  content: unknown;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<RecordContentSnapshotResponseDto>) {
    Object.assign(this, partial);
  }
}
