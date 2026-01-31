import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSpaceDto, UpdateSpaceDto } from '@nucleus/domain';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SpaceService } from './space.service';

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createSpaceDto: CreateSpaceDto,
  ) {
    return this.spaceService.create(userId, {
      ...createSpaceDto,
    });
  }

  @Get()
  async findAll(@CurrentUser('userId') userId: string) {
    return this.spaceService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spaceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.spaceService.update(id, updateSpaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spaceService.remove(id);
  }
}
