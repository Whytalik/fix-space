import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRecordDto, UpdateRecordDto } from '@nucleus/domain';
import { RecordService } from './record.service';

@Controller('databases/:databaseId/records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  create(
    @Param('databaseId') databaseId: string,
    @Body() createRecordDto: CreateRecordDto,
  ) {
    return this.recordService.create(databaseId, createRecordDto);
  }

  @Get()
  findAll(@Param('databaseId') databaseId: string) {
    return this.recordService.findAll(databaseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recordService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecordDto: UpdateRecordDto) {
    return this.recordService.update(id, updateRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordService.remove(id);
  }
}
