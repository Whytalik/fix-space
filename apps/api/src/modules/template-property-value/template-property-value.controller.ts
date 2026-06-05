import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateTemplatePropertyValueDto, TemplatePropertyValueResponseDto, UpdateTemplatePropertyValueDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "../../core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "../../core/auth/guards/resource-owner.guard";
import { TemplatePropertyValueService } from "./template-property-value.service";

@ApiTags("Template Property Values")
@ApiBearerAuth("access-token")
@Controller("template-values")
export class TemplatePropertyValueController {
  constructor(private readonly templatePropertyValueService: TemplatePropertyValueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a template property value" })
  @ApiBody({ type: CreateTemplatePropertyValueDto })
  @ApiResponse({ status: 201, description: "Template property value created.", type: TemplatePropertyValueResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 404, description: "Template or property not found." })
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    dto: CreateTemplatePropertyValueDto,
  ) {
    return this.templatePropertyValueService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all template property values for a template" })
  @ApiQuery({ name: "templateId", type: String, description: "Template ID" })
  @ApiResponse({ status: 200, description: "List of template property values.", type: [TemplatePropertyValueResponseDto] })
  findAll(
    @Query("templateId")
    templateId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templatePropertyValueService.findAll(templateId, userId);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "templatePropertyValue",
    ownerPath: ["template", "database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Get template property value by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Template property value found.", type: TemplatePropertyValueResponseDto })
  @ApiResponse({ status: 404, description: "Template property value not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  findOne(@Param("id") id: string) {
    return this.templatePropertyValueService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "templatePropertyValue",
    ownerPath: ["template", "database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Update template property value" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateTemplatePropertyValueDto })
  @ApiResponse({ status: 200, description: "Template property value updated.", type: TemplatePropertyValueResponseDto })
  @ApiResponse({ status: 404, description: "Template property value not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  update(
    @Param("id") id: string,
    @Body()
    dto: UpdateTemplatePropertyValueDto,
  ) {
    return this.templatePropertyValueService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "templatePropertyValue",
    ownerPath: ["template", "database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Delete template property value" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Template property value deleted." })
  @ApiResponse({ status: 404, description: "Template property value not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  remove(@Param("id") id: string) {
    return this.templatePropertyValueService.remove(id);
  }
}
