import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UpdateRecordContentDto } from '@nucleus/domain';
import { RecordContentService } from './record-content.service';

@Controller('records/:recordId/content')
export class RecordContentController {
  constructor(private readonly recordContentService: RecordContentService) {}

  @Get()
  findOrCreate(@Param('recordId') recordId: string) {
    return this.recordContentService.findOrCreate(recordId);
  }

  @Put()
  upsert(
    @Param('recordId') recordId: string,
    @Body() updateRecordContentDto: UpdateRecordContentDto,
  ) {
    return this.recordContentService.upsert(recordId, updateRecordContentDto);
  }

  @Delete()
  remove(@Param('recordId') recordId: string) {
    return this.recordContentService.remove(recordId);
  }
}
