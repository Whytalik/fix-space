import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  CreateIntegrationConnectionDto,
  ImportTradesDto,
  IntegrationConnectionResponseDto,
  PreviewTradesDto,
  PreviewTradesResponseDto,
  UpdateIntegrationConnectionDto,
} from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { IntegrationConnectionService } from "./integration-connection.service";

@ApiTags("Integration Connections")
@ApiBearerAuth("access-token")
@Controller("integration-connections")
export class IntegrationConnectionController {
  constructor(private readonly integrationConnectionService: IntegrationConnectionService) {}

  @Get()
  @ApiOperation({ summary: "List all integration connections for the current user" })
  @ApiResponse({ status: 200, type: [IntegrationConnectionResponseDto] })
  findAll(@CurrentUser("userId") userId: string) {
    return this.integrationConnectionService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new integration connection" })
  @ApiResponse({ status: 201, type: IntegrationConnectionResponseDto })
  @ApiResponse({ status: 400, description: "Connection limit reached or validation error." })
  create(@CurrentUser("userId") userId: string, @Body() dto: CreateIntegrationConnectionDto) {
    return this.integrationConnectionService.create(userId, dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single integration connection" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, type: IntegrationConnectionResponseDto })
  @ApiResponse({ status: 404, description: "Connection not found." })
  findOne(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.integrationConnectionService.findOne(id, userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an integration connection" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateIntegrationConnectionDto })
  @ApiResponse({ status: 200, type: IntegrationConnectionResponseDto })
  @ApiResponse({ status: 404, description: "Connection not found." })
  update(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() dto: UpdateIntegrationConnectionDto) {
    return this.integrationConnectionService.update(id, userId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an integration connection" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 204, description: "Connection deleted." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  delete(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.integrationConnectionService.delete(id, userId);
  }

  @Post(":id/sync")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Trigger a manual sync for an integration connection" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({
    required: false,
    schema: {
      type: "object",
      properties: { startDate: { type: "string", format: "date-time" }, endDate: { type: "string", format: "date-time" } },
    },
  })
  @ApiResponse({ status: 200, description: "Sync completed." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  triggerSync(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() body?: { startDate?: string; endDate?: string }) {
    return this.integrationConnectionService.triggerSync(id, userId, body);
  }

  @Post(":id/trades/preview")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Preview trades available from broker for a date range" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: PreviewTradesDto })
  @ApiResponse({ status: 200, type: PreviewTradesResponseDto })
  @ApiResponse({ status: 404, description: "Connection not found." })
  previewTrades(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() dto: PreviewTradesDto) {
    return this.integrationConnectionService.previewTrades(id, userId, dto);
  }

  @Post(":id/trades/import")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Import selected trades into the Trading Journal" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: ImportTradesDto })
  @ApiResponse({ status: 200, description: "Import completed." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  importTrades(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() dto: ImportTradesDto) {
    return this.integrationConnectionService.importTrades(id, userId, dto);
  }
}
