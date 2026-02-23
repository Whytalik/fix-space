import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateDatabaseDto, UpdateDatabaseDto } from '@nucleus/domain';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RequireOwnership } from 'src/auth/decorators/required-ownership.decoractor';
import { ResourceOwnerGuard } from './../auth/guards/resourse-owner.guard';
import { DatabaseService } from './database.service';

@Controller('spaces/:spaceId/databases')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post()
  create(
    @Param('spaceId') spaceId: string,
    @CurrentUser('userId') userId: string,
    @Body() createDatabaseDto: CreateDatabaseDto,
  ) {
    return this.databaseService.create(spaceId, createDatabaseDto, userId);
  }

  @Get()
  findAll(
    @Param('spaceId') spaceId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.databaseService.findAll(spaceId, userId);
  }

  @Get(':id')
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: 'space', param: 'spaceId', ownerField: 'ownerId' })
  findOne(@Param('id') id: string) {
    return this.databaseService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: 'space', param: 'spaceId', ownerField: 'ownerId' })
  update(
    @Param('id') id: string,
    @Body() updateDatabaseDto: UpdateDatabaseDto,
  ) {
    return this.databaseService.update(id, updateDatabaseDto);
  }

  @Delete(':id')
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: 'space', param: 'spaceId', ownerField: 'ownerId' })
  remove(@Param('id') id: string) {
    return this.databaseService.remove(id);
  }
}
