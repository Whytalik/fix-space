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
import { CreateSpaceDto, UpdateSpaceDto } from '@nucleus/domain';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireOwnership } from '../auth/decorators/required-ownership.decoractor';
import { ResourceOwnerGuard } from '../auth/guards/resourse-owner.guard';
import { DuplicateSpaceUseCase } from './providers/duplicate-space.usecase';
import { SpaceService } from './space.service';

@Controller('spaces')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly duplicateSpaceUseCase: DuplicateSpaceUseCase,
  ) {}

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
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: 'space', param: 'ownerId', ownerField: 'id' })
  findOne(@Param('id') id: string) {
    return this.spaceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: 'space', param: 'ownerId', ownerField: 'id' })
  update(@Param('id') id: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.spaceService.update(id, updateSpaceDto);
  }

  @Delete(':id')
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: 'space', param: 'ownerId', ownerField: 'id' })
  remove(@Param('id') id: string) {
    return this.spaceService.remove(id);
  }

  @Post(':id/duplicate')
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: 'space', param: 'ownerId', ownerField: 'id' })
  duplicate(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() body?: { name?: string },
  ) {
    return this.duplicateSpaceUseCase.execute(id, userId, {
      newName: body?.name,
    });
  }
}
