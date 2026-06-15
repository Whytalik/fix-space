import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreatePropertyValueDto, PropertyValueResponseDto, UpdatePropertyValueDto } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "@/core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { PropertyValueService } from "./property-value.service";

@ApiTags("Property Values")
@ApiBearerAuth("access-token")
@Controller("values")
export class PropertyValueController {
  constructor(private readonly propertyValueService: PropertyValueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a property value for a record" })
  @ApiBody({ type: CreatePropertyValueDto })
  @ApiResponse({ status: 201, description: "Property value created.", type: PropertyValueResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Record or property not found." })
  create(@CurrentUser("userId") userId: string, @Body() createPropertyValueDto: CreatePropertyValueDto) {
    return this.propertyValueService.create(createPropertyValueDto.recordId, createPropertyValueDto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all property values for a record" })
  @ApiQuery({ name: "recordId", type: String, description: "Record ID" })
  @ApiResponse({ status: 200, description: "List of property values.", type: [PropertyValueResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  findAll(@Query("recordId") recordId: string, @CurrentUser("userId") userId: string) {
    return this.propertyValueService.findAll(recordId, userId);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "propertyValue",
    ownerPath: ["record", "database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Get property value by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Property value found.", type: PropertyValueResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Property value not found." })
  findOne(@Param("id") id: string) {
    return this.propertyValueService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "propertyValue",
    ownerPath: ["record", "database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Update property value" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdatePropertyValueDto })
  @ApiResponse({ status: 200, description: "Property value updated.", type: PropertyValueResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Property value not found." })
  update(@Param("id") id: string, @Body() updatePropertyValueDto: UpdatePropertyValueDto, @CurrentUser("userId") userId: string) {
    return this.propertyValueService.update(id, updatePropertyValueDto, userId);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "propertyValue",
    ownerPath: ["record", "database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Delete property value" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Property value deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Property value not found." })
  remove(@Param("id") id: string) {
    return this.propertyValueService.remove(id);
  }
}
