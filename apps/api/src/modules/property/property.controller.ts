import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreatePropertyDto, FormulaPropertyConfig, PropertyResponseDto, UpdatePropertyDto } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { t } from "@/common/utils/i18n.helper";
import { PropertyService } from "./property.service";

@ApiTags("Properties")
@ApiBearerAuth("access-token")
@Controller("properties")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new property in a database" })
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({ status: 201, description: "Property created successfully.", type: PropertyResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 404, description: "Database not found." })
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    createPropertyDto: CreatePropertyDto,
  ) {
    if (!createPropertyDto.databaseId) {
      throw new BadRequestException(t("errors.DATABASE_ID_REQUIRED"));
    }
    return this.propertyService.create(createPropertyDto.databaseId, createPropertyDto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all properties in a database" })
  @ApiQuery({ name: "databaseId", type: String, description: "Database ID" })
  @ApiResponse({ status: 200, description: "List of properties.", type: [PropertyResponseDto] })
  @ApiResponse({ status: 404, description: "Database not found." })
  findAll(
    @Query("databaseId")
    databaseId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyService.findAll(databaseId, userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get property by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Property found.", type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: "Property not found." })
  findOne(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyService.findOne(id, userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update property" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiResponse({ status: 200, description: "Property updated.", type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: "Property not found." })
  update(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
    @Body()
    updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(id, updatePropertyDto, userId);
  }

  @Post(":id/duplicate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Duplicate property" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 201, description: "Property duplicated.", type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: "Property not found." })
  duplicate(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyService.duplicate(id, userId);
  }

  @Post("preview-formula")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Preview formula result against the first database record" })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: "Formula preview result." })
  previewFormulaForDatabase(@Body() body: { databaseId: string; config: FormulaPropertyConfig }) {
    return this.propertyService.previewFormulaForDatabase(body.databaseId, body.config);
  }

  @Post(":id/preview")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Preview formula result" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: "Formula preview successful." })
  preview(@Param("id") id: string, @Body() body: { config: FormulaPropertyConfig; recordValues: Record<string, unknown> }) {
    return this.propertyService.previewFormula(id, body.config, body.recordValues);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete property" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Property deleted." })
  @ApiResponse({ status: 404, description: "Property not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyService.remove(id, userId);
  }
}
