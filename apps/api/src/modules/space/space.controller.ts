import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateSpaceDto, SpaceResponseDto, UpdateSpaceDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "../../core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "../../core/auth/guards/resource-owner.guard";
import { DuplicateSpaceUseCase } from "./providers/duplicate-space.usecase";
import { InitializeUserSpaceUseCase } from "./providers/initialize-user-space.usecase";
import { SpaceService } from "./space.service";

@ApiTags("Spaces")
@Controller("spaces")
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly duplicateSpaceUseCase: DuplicateSpaceUseCase,
    private readonly initializeUserSpaceUseCase: InitializeUserSpaceUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new workspace with preset databases" })
  @ApiBody({ type: CreateSpaceDto })
  @ApiResponse({ status: 201, description: "Workspace created successfully.", type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  create(@CurrentUser("userId") userId: string, @Body() createSpaceDto: CreateSpaceDto) {
    return this.initializeUserSpaceUseCase.createAndSeed(userId, createSpaceDto);
  }

  @Get()
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Get all workspaces for current user" })
  @ApiResponse({ status: 200, description: "List of workspaces.", type: [SpaceResponseDto] })
  findAll(@CurrentUser("userId") userId: string) {
    return this.spaceService.findAll(userId);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Get workspace by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Workspace found.", type: SpaceResponseDto })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  findOne(@Param("id") id: string) {
    return this.spaceService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Update workspace" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateSpaceDto })
  @ApiResponse({ status: 200, description: "Workspace updated.", type: SpaceResponseDto })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  update(@Param("id") id: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.spaceService.update(id, updateSpaceDto);
  }

  @Post(":id/duplicate")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Duplicate workspace with all structure (databases, properties, templates, records)" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 201, description: "Workspace duplicated.", type: SpaceResponseDto })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  duplicate(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.duplicateSpaceUseCase.execute(id, userId);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete workspace" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Workspace deleted.", type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: "Cannot delete default workspace." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  remove(@Param("id") id: string) {
    return this.spaceService.remove(id);
  }
}
