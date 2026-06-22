import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateViewDto, UpdateViewDto, ViewResponseDto } from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "@/core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { ViewService } from "./view.service";

interface ReorderDto {
  viewOrders: { id: string; position: number }[];
}

@ApiTags("Views")
@ApiBearerAuth("access-token")
@Controller()
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @Get("databases/:databaseId/views")
  @ApiOperation({ summary: "Get all views for a database" })
  @ApiParam({ name: "databaseId", type: String })
  @ApiResponse({ status: 200, description: "List of views.", type: [ViewResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "Database not found." })
  findAll(@Param("databaseId") databaseId: string, @CurrentUser("userId") userId: string) {
    return this.viewService.findAll(databaseId, userId);
  }

  @Post("databases/:databaseId/views")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "database",
    ownerPath: ["space", "ownerId"],
    param: "databaseId",
  })
  @ApiOperation({ summary: "Create a new view for a database" })
  @ApiParam({ name: "databaseId", type: String })
  @ApiBody({ type: CreateViewDto })
  @ApiResponse({ status: 201, description: "View created successfully.", type: ViewResponseDto })
  @ApiResponse({ status: 400, description: "View limit reached." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "Database not found." })
  create(@Param("databaseId") databaseId: string, @Body() createViewDto: CreateViewDto, @CurrentUser("userId") userId: string) {
    return this.viewService.create(databaseId, createViewDto, userId);
  }

  @Patch("databases/:databaseId/views/reorder")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "database",
    ownerPath: ["space", "ownerId"],
    param: "databaseId",
  })
  @ApiOperation({ summary: "Reorder views" })
  @ApiParam({ name: "databaseId", type: String })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        viewOrders: { type: "array", items: { type: "object", properties: { id: { type: "string" }, position: { type: "integer" } } } },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Views reordered.", type: [ViewResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  reorder(@Param("databaseId") databaseId: string, @Body() body: ReorderDto) {
    return this.viewService.reorder(databaseId, body.viewOrders);
  }

  @Get("views/:id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "view",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Get view by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "View found.", type: ViewResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "View not found." })
  findOne(@Param("id") id: string) {
    return this.viewService.findOne(id);
  }

  @Patch("views/:id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "view",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Update view" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateViewDto })
  @ApiResponse({ status: 200, description: "View updated.", type: ViewResponseDto })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "View not found." })
  update(@Param("id") id: string, @Body() updateViewDto: UpdateViewDto) {
    return this.viewService.update(id, updateViewDto);
  }

  @Delete("views/:id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "view",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Delete view" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "View deleted.", type: ViewResponseDto })
  @ApiResponse({ status: 400, description: "Cannot delete the last view." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "View not found." })
  remove(@Param("id") id: string) {
    return this.viewService.delete(id);
  }

  @Post("views/:id/duplicate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "view",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Duplicate view" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 201, description: "View duplicated.", type: ViewResponseDto })
  @ApiResponse({ status: 400, description: "View limit reached." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  @ApiResponse({ status: 404, description: "View not found." })
  duplicate(@Param("id") id: string) {
    return this.viewService.duplicate(id);
  }
}
