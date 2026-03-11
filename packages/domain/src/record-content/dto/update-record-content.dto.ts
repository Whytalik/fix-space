import { IsObject } from 'class-validator';
import { ContainerBlock } from './content-node.dto';

export class UpdateRecordContentDto {
  @IsObject()
  content: ContainerBlock;
}
