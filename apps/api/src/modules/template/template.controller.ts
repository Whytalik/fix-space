import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateTemplateDto, TemplateResponseDto, UpdateTemplateDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "../../core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "../../core/auth/guards/resource-owner.guard";
import { DuplicateTemplateUseCase } from "./providers/duplicate-template.usecase";
import { TemplateService } from "./template.service";

@ApiTags("Templates")
@ApiBearerAuth("access-token")
@Controller("templates")
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private readonly duplicateTemplateUseCase: DuplicateTemplateUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new template in a database" })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201, description: "Template created successfully.", type: TemplateResponseDto })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 404, description: "Database not found." })
  create(@CurrentUser("userId") userId: string, @Body() dto: CreateTemplateDto) {
    return this.templateService.create(dto.databaseId, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all templates in a database" })
  @ApiQuery({ name: "databaseId", type: String, description: "Database ID" })
  @ApiResponse({ status: 200, description: "List of templates.", type: [TemplateResponseDto] })
  @ApiResponse({ status: 404, description: "Database not found." })
  findAll(@Query("databaseId") databaseId: string, @CurrentUser("userId") userId: string) {
    return this.templateService.findAll(databaseId, userId);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "template",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Get template by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Template found.", type: TemplateResponseDto })
  @ApiResponse({ status: 404, description: "Template not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  findOne(@Param("id") id: string) {
    return this.templateService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "template",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Update template" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200, description: "Template updated.", type: TemplateResponseDto })
  @ApiResponse({ status: 404, description: "Template not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  update(@Param("id") id: string, @Body() dto: UpdateTemplateDto) {
    return this.templateService.update(id, dto);
  }

  @Post(":id/duplicate")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "template",
    ownerPath: ["database", "space", "ownerId"],
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Duplicate template with all property values" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 201, description: "Template duplicated.", type: TemplateResponseDto })
  @ApiResponse({ status: 404, description: "Template not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  duplicate(@Param("id") id: string) {
    return this.duplicateTemplateUseCase.execute(id);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "template",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Delete template" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Template deleted.", type: TemplateResponseDto })
  @ApiResponse({ status: 400, description: "Cannot delete last template in database." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  remove(@Param("id") id: string) {
    return this.templateService.remove(id);
  }
}
