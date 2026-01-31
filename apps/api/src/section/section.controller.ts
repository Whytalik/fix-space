import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSectionDto, UpdateSectionDto } from '@nucleus/domain';
import { SectionService } from './section.service';

@Controller('spaces/:spaceId/sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  create(
    @Param('spaceId') spaceId: string,
    @Body() createSectionDto: CreateSectionDto,
  ) {
    return this.sectionService.create(spaceId, createSectionDto);
  }

  @Get()
  findAll(@Param('spaceId') spaceId: string) {
    return this.sectionService.findAll(spaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionService.update(id, updateSectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionService.remove(id);
  }
}
