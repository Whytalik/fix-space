import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  AvailablePresetTypeDto,
  CreateDatabaseDto,
  DatabaseResponseDto,
  DuplicateDatabaseDto,
  RestorePresetDatabaseDto,
  UpdateDatabaseDto,
} from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "@/core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { DatabaseService } from "./database.service";
import { DuplicateDatabaseUseCase } from "./providers/duplicate-database.usecase";
import { PresetRestoreService } from "./providers/preset-restore.service";

@ApiTags("Databases")
@ApiBearerAuth("access-token")
@Controller("databases")
export class DatabaseController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly duplicateDatabaseUseCase: DuplicateDatabaseUseCase,
    private readonly presetRestoreService: PresetRestoreService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new database in a workspace" })
  @ApiBody({ type: CreateDatabaseDto })
  @ApiResponse({ status: 201, description: "Database created successfully.", type: DatabaseResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  create(@CurrentUser("userId") userId: string, @Body() createDatabaseDto: CreateDatabaseDto) {
    createDatabaseDto.isPreset = false;
    return this.databaseService.create(createDatabaseDto.spaceId, createDatabaseDto, userId);
  }

  @Get("available-preset-types")
  @ApiOperation({ summary: "Get preset database types available for restore (deleted system databases)" })
  @ApiResponse({ status: 200, description: "List of available preset types.", type: [AvailablePresetTypeDto] })
  getAvailablePresetTypes(@CurrentUser("userId") userId: string) {
    return this.presetRestoreService.getAvailablePresetTypes(userId);
  }

  @Post("restore-preset")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Restore a preset database (recreate with properties, templates, views)" })
  @ApiBody({ type: RestorePresetDatabaseDto })
  @ApiResponse({ status: 201, description: "Preset database restored.", type: DatabaseResponseDto })
  @ApiResponse({ status: 400, description: "Unknown preset type." })
  @ApiResponse({ status: 409, description: "Database of this type already exists." })
  restorePreset(@CurrentUser("userId") userId: string, @Body() dto: RestorePresetDatabaseDto) {
    return this.presetRestoreService.restore(userId, dto.type, dto.spaceId, dto.sectionId);
  }

  @Get()
  @ApiOperation({ summary: "Get all databases in a workspace" })
  @ApiQuery({ name: "spaceId", type: String, description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "List of databases.", type: [DatabaseResponseDto] })
  @ApiResponse({ status: 404, description: "Workspace not found." })
  findAll(@Query("spaceId") spaceId: string, @CurrentUser("userId") userId: string) {
    return this.databaseService.findAll(spaceId, userId);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "database",
    ownerPath: ["space", "ownerId"],
  })
  @ApiOperation({ summary: "Get database by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Database found.", type: DatabaseResponseDto })
  @ApiResponse({ status: 404, description: "Database not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  findOne(@Param("id") id: string) {
    return this.databaseService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "database",
    ownerPath: ["space", "ownerId"],
  })
  @ApiOperation({ summary: "Update database" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateDatabaseDto })
  @ApiResponse({ status: 200, description: "Database updated.", type: DatabaseResponseDto })
  @ApiResponse({ status: 404, description: "Database not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  update(@Param("id") id: string, @Body() updateDatabaseDto: UpdateDatabaseDto) {
    return this.databaseService.update(id, updateDatabaseDto);
  }

  @Post(":id/duplicate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "database",
    ownerPath: ["space", "ownerId"],
  })
  @ApiOperation({ summary: "Duplicate database with selective options (properties, records, templates)" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: DuplicateDatabaseDto })
  @ApiResponse({ status: 201, description: "Database duplicated.", type: DatabaseResponseDto })
  @ApiResponse({ status: 404, description: "Database not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  duplicate(@CurrentUser("userId") userId: string, @Param("id") id: string, @Body() duplicateDatabaseDto: DuplicateDatabaseDto) {
    return this.duplicateDatabaseUseCase.execute(id, userId, duplicateDatabaseDto);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "database",
    ownerPath: ["space", "ownerId"],
  })
  @ApiOperation({ summary: "Delete database" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Database deleted.", type: DatabaseResponseDto })
  @ApiResponse({ status: 400, description: "Cannot delete system database." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  remove(@Param("id") id: string) {
    return this.databaseService.remove(id);
  }
}
