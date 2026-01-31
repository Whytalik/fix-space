import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateDatabaseDto, UpdateDatabaseDto } from '@nucleus/domain';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post()
  create(
    @Param('spaceId') spaceId: string,
    @Body() createDatabaseDto: CreateDatabaseDto,
  ) {
    return this.databaseService.create(spaceId, createDatabaseDto);
  }

  @Get()
  findAll(@Param('spaceId') spaceId: string) {
    return this.databaseService.findAll(spaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.databaseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDatabaseDto: UpdateDatabaseDto,
  ) {
    return this.databaseService.update(id, updateDatabaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.databaseService.remove(id);
  }
}
