import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePropertyDto, UpdatePropertyDto } from '@nucleus/domain';
import { PropertyService } from './property.service';

@Controller('databases/:databaseId/properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  create(
    @Param('databaseId') databaseId: string,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertyService.create(databaseId, createPropertyDto);
  }

  @Get()
  findAll(@Param('databaseId') databaseId: string) {
    return this.propertyService.findAll(databaseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
