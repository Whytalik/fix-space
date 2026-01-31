import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSectionDto, UpdateSectionDto } from '@nucleus/domain';
import { SectionService } from './section.service';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  async create(
    @Param('spaceId') spaceId: string,
    createSectionDto: CreateSectionDto,
  ) {
    return await this.sectionService.create(spaceId, createSectionDto);
  }

  @Get()
  async findAll(@Param('spaceId') spaceId: string) {
    return await this.sectionService.findAll(spaceId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.sectionService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, updateSectionDto: UpdateSectionDto) {
    return await this.sectionService.update(id, updateSectionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.sectionService.remove(id);
  }
}
