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
import { SystemUserProvider } from '../user/system-user.provider';
import { SpaceService } from './space.service';

@Controller('space')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly systemUserProvider: SystemUserProvider,
  ) {}

  @Post()
  async create(@Body() createSpaceDto: CreateSpaceDto) {
    const systemUser = await this.systemUserProvider.get();

    return this.spaceService.create({
      ...createSpaceDto,
      ownerId: systemUser.id,
    });
  }

  @Get()
  async findAll() {
    const systemUser = await this.systemUserProvider.get();

    return this.spaceService.findAll(systemUser.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.spaceService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    return this.spaceService.update(id, updateSpaceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.spaceService.remove(id);
  }
}
