import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreatePropertyValueDto,
  UpdatePropertyValueDto,
} from '@nucleus/domain';
import { PropertyValueService } from './property-value.service';

@Controller('records/:recordId/values')
export class PropertyValueController {
  constructor(private readonly propertyValueService: PropertyValueService) { }

  @Post()
  create(
    @Param('recordId') recordId: string,
    @Body() createPropertyValueDto: CreatePropertyValueDto,
  ) {
    return this.propertyValueService.create(recordId, createPropertyValueDto);
  }

  @Get()
  findAll(@Param('recordId') recordId: string) {
    return this.propertyValueService.findAll(recordId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyValueService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyValueDto: UpdatePropertyValueDto,
  ) {
    return this.propertyValueService.update(id, updatePropertyValueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyValueService.remove(id);
  }
}
