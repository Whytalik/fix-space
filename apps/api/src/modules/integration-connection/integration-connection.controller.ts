import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  CreateIntegrationConnectionDto,
  ImportTradesDto,
  IntegrationConnectionResponseDto,
  PreviewTradesDto,
  PreviewTradesResponseDto,
  UpdateIntegrationConnectionDto,
} from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { Public } from "@/core/auth/decorators/public.decorator";
import { RequireOwnership } from "@/core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { t } from "@/common/utils/i18n.helper";
import { IntegrationConnectionService } from "./integration-connection.service";
import { MT5WebhookDto } from "./dto/mt5-webhook.dto";

@ApiTags("Integration Connections")
@ApiBearerAuth("access-token")
@Controller("integration-connections")
export class IntegrationConnectionController {
  constructor(private readonly integrationConnectionService: IntegrationConnectionService) {}

  @Get()
  @ApiOperation({ summary: "List all integration connections for the current user" })
  @ApiResponse({ status: 200, description: "List of connections.", type: [IntegrationConnectionResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  findAll(@CurrentUser("userId") userId: string) {
    return this.integrationConnectionService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new integration connection" })
  @ApiBody({ type: CreateIntegrationConnectionDto })
  @ApiResponse({ status: 201, description: "Connection created.", type: IntegrationConnectionResponseDto })
  @ApiResponse({ status: 400, description: "Connection limit reached or validation error." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  create(@CurrentUser("userId") userId: string, @Body() dto: CreateIntegrationConnectionDto) {
    return this.integrationConnectionService.create(userId, dto);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "integrationConnection", ownerPath: ["userId"] })
  @ApiOperation({ summary: "Get a single integration connection" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Connection found.", type: IntegrationConnectionResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  findOne(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.integrationConnectionService.findOne(id, userId);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "integrationConnection", ownerPath: ["userId"] })
  @ApiOperation({ summary: "Update an integration connection" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateIntegrationConnectionDto })
  @ApiResponse({ status: 200, description: "Connection updated.", type: IntegrationConnectionResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  update(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() dto: UpdateIntegrationConnectionDto) {
    return this.integrationConnectionService.update(id, userId, dto);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "integrationConnection", ownerPath: ["userId"] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an integration connection" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 204, description: "Connection deleted." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  delete(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.integrationConnectionService.delete(id, userId);
  }

  @Post(":id/sync")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "integrationConnection", ownerPath: ["userId"] })
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
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  triggerSync(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() body?: { startDate?: string; endDate?: string }) {
    return this.integrationConnectionService.triggerSync(id, userId, body);
  }

  @Post(":id/trades/preview")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "integrationConnection", ownerPath: ["userId"] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Preview trades available from broker for a date range" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: PreviewTradesDto })
  @ApiResponse({ status: 200, description: "Trade preview.", type: PreviewTradesResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  previewTrades(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() dto: PreviewTradesDto) {
    return this.integrationConnectionService.previewTrades(id, userId, dto);
  }

  @Post(":id/trades/import")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({ model: "integrationConnection", ownerPath: ["userId"] })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Import selected trades into the Trading Journal" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: ImportTradesDto })
  @ApiResponse({ status: 200, description: "Import completed." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Connection not found." })
  importTrades(@Param("id") id: string, @CurrentUser("userId") userId: string, @Body() dto: ImportTradesDto) {
    return this.integrationConnectionService.importTrades(id, userId, dto);
  }

  @Public()
  @Post("mt5/webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Webhook for receiving MT5 trades from MQL5 EA" })
  @ApiBody({ type: MT5WebhookDto })
  @ApiResponse({ status: 200, description: "Trades received successfully." })
  @ApiResponse({ status: 401, description: "Unauthorized. Invalid token." })
  mt5Webhook(@Headers("x-api-key") token: string, @Body() dto: MT5WebhookDto) {
    if (!token) {
      throw new UnauthorizedException(t("errors.INTEGRATION_MISSING_API_KEY_HEADER"));
    }
    return this.integrationConnectionService.handleMT5Webhook(token, dto);
  }
}
