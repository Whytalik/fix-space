import { Exclude, Expose } from 'class-transformer';
import { ContainerBlock } from './content-node.dto';

@Exclude()
export class RecordContentResponseDto {
  @Expose()
  id: string;

  @Expose()
  recordId: string;

  @Expose()
  content: ContainerBlock;

  @Expose()
  lastEditedAt: Date;

  constructor(partial: Partial<RecordContentResponseDto>) {
    Object.assign(this, partial);
  }
}
