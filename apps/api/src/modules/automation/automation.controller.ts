import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AutomationLogResponseDto, AutomationResponseDto, CreateAutomationDto, UpdateAutomationDto } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";

import { AutomationService } from "./automation.service";

@ApiTags("Automation")
@ApiBearerAuth("access-token")
@Controller("automations")
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create automation" })
  @ApiBody({ type: CreateAutomationDto })
  @ApiResponse({ status: 201, type: AutomationResponseDto })
  @ApiResponse({ status: 404, description: "Database not found." })
  @ApiResponse({ status: 400, description: "Automation limit exceeded." })
  create(@Body() dto: CreateAutomationDto, @CurrentUser("userId") userId: string) {
    return this.automationService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all automations for a database" })
  @ApiQuery({ name: "databaseId", type: String, description: "Database ID" })
  @ApiResponse({ status: 200, type: [AutomationResponseDto] })
  @ApiResponse({ status: 404, description: "Database not found." })
  findAll(@Query("databaseId") databaseId: string, @CurrentUser("userId") userId: string) {
    return this.automationService.findAll(databaseId, userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get automation by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, type: AutomationResponseDto })
  @ApiResponse({ status: 404, description: "Automation not found." })
  findOne(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.automationService.findOne(id, userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update automation" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateAutomationDto })
  @ApiResponse({ status: 200, type: AutomationResponseDto })
  @ApiResponse({ status: 404, description: "Automation not found." })
  update(@Param("id") id: string, @Body() dto: UpdateAutomationDto, @CurrentUser("userId") userId: string) {
    return this.automationService.update(id, dto, userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete automation" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: "Automation not found." })
  delete(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.automationService.delete(id, userId);
  }

  @Get(":id/logs")
  @ApiOperation({ summary: "Get last 50 execution logs for an automation" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, type: [AutomationLogResponseDto] })
  @ApiResponse({ status: 404, description: "Automation not found." })
  getLogs(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.automationService.getLogs(id, userId);
  }

  @Post(":id/test")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Dry-run an automation on a specific record" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ schema: { properties: { recordId: { type: "string" } }, required: ["recordId"] } })
  @ApiResponse({ status: 200, description: "Preview of what would happen." })
  @ApiResponse({ status: 404, description: "Automation or record not found." })
  test(@Param("id") id: string, @Body("recordId") recordId: string, @CurrentUser("userId") userId: string) {
    return this.automationService.testRun(id, recordId, userId);
  }
}
