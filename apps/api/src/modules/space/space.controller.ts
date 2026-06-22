import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  CreateSpaceDto,
  DuplicateSectionDto,
  DuplicateSpaceDto,
  SectionResponseDto,
  SpaceResponseDto,
  UpdateSpaceDto,
} from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "@/core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { DuplicateSectionUseCase } from "./providers/duplicate-section.usecase";
import { DuplicateSpaceUseCase } from "./providers/duplicate-space.usecase";
import { GetDashboardUseCase } from "./providers/get-dashboard.usecase";
import { InitializeUserSpaceUseCase } from "./providers/initialize-user-space.usecase";
import { SpaceService } from "./space.service";

@ApiTags("Spaces")
@ApiBearerAuth("access-token")
@Controller("spaces")
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly duplicateSpaceUseCase: DuplicateSpaceUseCase,
    private readonly duplicateSectionUseCase: DuplicateSectionUseCase,
    private readonly initializeUserSpaceUseCase: InitializeUserSpaceUseCase,
    private readonly getDashboardUseCase: GetDashboardUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new workspace with preset databases" })
  @ApiBody({ type: CreateSpaceDto })
  @ApiResponse({ status: 201, description: "Workspace created successfully.", type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: "Validation error or workspace limit reached." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  create(@CurrentUser("userId") userId: string, @Body() createSpaceDto: CreateSpaceDto) {
    return this.initializeUserSpaceUseCase.createAndSeed(userId, createSpaceDto);
  }

  @Get(":id/dashboard")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiOperation({ summary: "Get workspace dashboard data" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Dashboard data retrieved." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  getDashboard(@Param("id") id: string) {
    return this.getDashboardUseCase.execute(id);
  }

  @Get()
  @ApiOperation({ summary: "Get all workspaces for current user" })
  @ApiResponse({ status: 200, description: "List of workspaces.", type: [SpaceResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  findAll(@CurrentUser("userId") userId: string) {
    return this.spaceService.findAll(userId);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiOperation({ summary: "Get workspace by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Workspace found.", type: SpaceResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  findOne(@Param("id") id: string) {
    return this.spaceService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiOperation({ summary: "Update workspace" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateSpaceDto })
  @ApiResponse({ status: 200, description: "Workspace updated.", type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  update(@Param("id") id: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.spaceService.update(id, updateSpaceDto);
  }

  @Post(":id/duplicate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiOperation({ summary: "Duplicate workspace with selective options (structure, sections, databases, properties, templates)" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: DuplicateSpaceDto })
  @ApiResponse({ status: 201, description: "Workspace duplicated.", type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: "Workspace limit reached." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  duplicate(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() duplicateSpaceDto: DuplicateSpaceDto) {
    return this.duplicateSpaceUseCase.execute(id, userId, duplicateSpaceDto);
  }

  @Post(":id/sections/:sectionId/duplicate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiOperation({ summary: "Duplicate section with all databases and structure" })
  @ApiParam({ name: "id", type: String })
  @ApiParam({ name: "sectionId", type: String })
  @ApiBody({ type: DuplicateSectionDto })
  @ApiResponse({ status: 201, description: "Section duplicated.", type: SectionResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Section not found." })
  duplicateSection(@Param("sectionId") sectionId: string, @Body() duplicateSectionDto: DuplicateSectionDto) {
    return this.duplicateSectionUseCase.execute(sectionId, duplicateSectionDto);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "space",
    ownerPath: ["ownerId"],
  })
  @ApiOperation({ summary: "Delete workspace" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Workspace deleted.", type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: "Cannot delete default workspace." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  remove(@Param("id") id: string) {
    return this.spaceService.remove(id);
  }
}
