import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePropertyDto, UpdatePropertyDto } from '@nucleus/domain';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PropertyService } from './property.service';

@Controller('databases/:databaseId/properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  create(
    @Param('databaseId') databaseId: string,
    @CurrentUser('userId') userId: string,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertyService.create(databaseId, createPropertyDto, userId);
  }

  @Get()
  findAll(@Param('databaseId') databaseId: string, @CurrentUser('userId') userId: string) {
    return this.propertyService.findAll(databaseId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.propertyService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('userId') userId: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(id, updatePropertyDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.propertyService.remove(id, userId);
  }
}
