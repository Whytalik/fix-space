import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreatePropertyGroupDto, PropertyGroupResponseDto, UpdatePropertyGroupDto } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { PropertyGroupService } from "./property-group.service";

@ApiTags("Property Groups")
@ApiBearerAuth("access-token")
@Controller("property-groups")
export class PropertyGroupController {
  constructor(private readonly propertyGroupService: PropertyGroupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new property group in a database" })
  @ApiBody({ type: CreatePropertyGroupDto })
  @ApiResponse({ status: 201, description: "Property group created successfully.", type: PropertyGroupResponseDto })
  @ApiResponse({ status: 404, description: "Database not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner or database is locked." })
  create(@Body() createDto: CreatePropertyGroupDto, @CurrentUser("userId") userId: string) {
    return this.propertyGroupService.create(createDto.databaseId, createDto, userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update property group" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdatePropertyGroupDto })
  @ApiResponse({ status: 200, description: "Property group updated.", type: PropertyGroupResponseDto })
  @ApiResponse({ status: 404, description: "Property group not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner or database is locked." })
  update(@Param("id") id: string, @Body() updateDto: UpdatePropertyGroupDto, @CurrentUser("userId") userId: string) {
    return this.propertyGroupService.update(id, updateDto, userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete property group" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Property group deleted." })
  @ApiResponse({ status: 404, description: "Property group not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner or database is locked." })
  remove(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.propertyGroupService.remove(id, userId);
  }
}
