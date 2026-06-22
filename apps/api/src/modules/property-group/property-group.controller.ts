import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreatePropertyGroupDto, PropertyGroupResponseDto, UpdatePropertyGroupDto } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "@/core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { PropertyGroupService } from "./property-group.service";

@ApiTags("Property Groups")
@ApiBearerAuth("access-token")
@Controller("property-groups")
export class PropertyGroupController {
  constructor(private readonly propertyGroupService: PropertyGroupService) {}

  @Get()
  @ApiOperation({ summary: "List property groups for a database" })
  @ApiQuery({ name: "databaseId", type: String })
  @ApiResponse({ status: 200, description: "Property groups retrieved.", type: [PropertyGroupResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  findAll(@Query("databaseId") databaseId: string, @CurrentUser("userId") userId: string) {
    return this.propertyGroupService.findAllByDatabase(databaseId, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new property group in a database" })
  @ApiBody({ type: CreatePropertyGroupDto })
  @ApiResponse({ status: 201, description: "Property group created successfully.", type: PropertyGroupResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner or database is locked." })
  @ApiResponse({ status: 404, description: "Database not found." })
  create(@Body() createDto: CreatePropertyGroupDto, @CurrentUser("userId") userId: string) {
    return this.propertyGroupService.create(createDto.databaseId, createDto, userId);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "propertyGroup", ownerPath: ["database", "space", "ownerId"] })
  @ApiOperation({ summary: "Update property group" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdatePropertyGroupDto })
  @ApiResponse({ status: 200, description: "Property group updated.", type: PropertyGroupResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner or database is locked." })
  @ApiResponse({ status: 404, description: "Property group not found." })
  update(@Param("id") id: string, @Body() updateDto: UpdatePropertyGroupDto, @CurrentUser("userId") userId: string) {
    return this.propertyGroupService.update(id, updateDto, userId);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "propertyGroup", ownerPath: ["database", "space", "ownerId"] })
  @ApiOperation({ summary: "Delete property group" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Property group deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner or database is locked." })
  @ApiResponse({ status: 404, description: "Property group not found." })
  remove(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.propertyGroupService.remove(id, userId);
  }
}
