import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  CreateRecordDto,
  FilterLogic,
  RecordFilterDto,
  RecordResponseDto,
  RecordSortDto,
  SpaceSearchResultDto,
  UpdateRecordDto,
} from "@fixspace/domain";
import { CurrentUser } from "@/core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "@/core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "@/core/auth/guards/resource-owner.guard";
import { parseJson } from "@/common/utils/parse-json";
import { FindRecordsUseCase } from "./providers/find-records.usecase";
import { SearchRecordsUseCase } from "./providers/search-records.usecase";
import { RecordService } from "./record.service";

@ApiTags("Records")
@ApiBearerAuth("access-token")
@Controller("records")
export class RecordController {
  constructor(
    private readonly recordService: RecordService,
    private readonly findRecordsUseCase: FindRecordsUseCase,
    private readonly searchRecordsUseCase: SearchRecordsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new record in a database" })
  @ApiBody({ type: CreateRecordDto })
  @ApiResponse({ status: 201, description: "Record created successfully." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 404, description: "Database not found." })
  create(@CurrentUser("userId") userId: string, @Body() createRecordDto: CreateRecordDto) {
    return this.recordService.create(createRecordDto.databaseId, createRecordDto, userId);
  }

  @Get("search")
  @ApiOperation({ summary: "Search records across a workspace" })
  @ApiQuery({ name: "spaceId", type: String, description: "Workspace ID" })
  @ApiQuery({ name: "q", type: String, description: "Search query string" })
  @ApiResponse({ status: 200, description: "Search results.", type: [SpaceSearchResultDto] })
  search(@Query("spaceId") spaceId: string, @Query("q") q: string, @CurrentUser("userId") userId: string): Promise<SpaceSearchResultDto[]> {
    return this.searchRecordsUseCase.execute(spaceId, userId, q);
  }

  @Get()
  @ApiOperation({ summary: "Get records in a database with optional pagination, sorting, and filtering" })
  @ApiQuery({ name: "databaseId", type: String, description: "Database ID" })
  @ApiQuery({ name: "page", type: Number, required: false, description: "Page number" })
  @ApiQuery({ name: "pageSize", type: Number, required: false, description: "Items per page" })
  @ApiQuery({ name: "sort", type: String, required: false, description: "JSON-serialized RecordSortDto[]" })
  @ApiQuery({ name: "filters", type: String, required: false, description: "JSON-serialized RecordFilterDto[]" })
  @ApiQuery({ name: "filterLogic", enum: FilterLogic, required: false, description: "Filter logic (AND/OR)" })
  @ApiQuery({ name: "search", type: String, required: false, description: "Text search within records" })
  @ApiResponse({ status: 200, description: "List of records." })
  @ApiResponse({ status: 404, description: "Database not found." })
  findAll(
    @Query("databaseId") databaseId: string,
    @Query("page", new ParseIntPipe({ optional: true })) page: number | undefined,
    @Query("pageSize", new ParseIntPipe({ optional: true })) pageSize: number | undefined,
    @Query("sort") sortRaw: string | undefined,
    @Query("filters") filtersRaw: string | undefined,
    @Query("filterLogic") filterLogic: FilterLogic | undefined,
    @Query("search") search: string | undefined,
    @CurrentUser("userId") userId: string,
  ) {
    const hasAdvanced = sortRaw !== undefined || filtersRaw !== undefined || filterLogic !== undefined || search !== undefined;

    if (!hasAdvanced) {
      if (page !== undefined && pageSize !== undefined) {
        return this.recordService.findAllPaged(databaseId, userId, page, pageSize);
      }
      return this.recordService.findAll(databaseId, userId);
    }

    const sort = sortRaw ? parseJson<RecordSortDto[]>(sortRaw, "sort") : undefined;
    const filters = filtersRaw ? parseJson<RecordFilterDto[]>(filtersRaw, "filters") : undefined;

    return this.findRecordsUseCase.execute(databaseId, userId, { page, pageSize, sort, filters, filterLogic, search });
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "record",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Get record by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Record found." })
  @ApiResponse({ status: 404, description: "Record not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  findOne(@Param("id") id: string) {
    return this.recordService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "record",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Update record" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateRecordDto })
  @ApiResponse({ status: 200, description: "Record updated." })
  @ApiResponse({ status: 404, description: "Record not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  update(@Param("id") id: string, @Body() updateRecordDto: UpdateRecordDto) {
    return this.recordService.update(id, updateRecordDto);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "record",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Delete record" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Record deleted." })
  @ApiResponse({ status: 404, description: "Record not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  remove(@Param("id") id: string) {
    return this.recordService.remove(id);
  }

  @Post(":id/duplicate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "record",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Duplicate a record with all its property values" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 201, description: "Record duplicated successfully." })
  @ApiResponse({ status: 404, description: "Record not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  duplicate(@Param("id") id: string) {
    return this.recordService.duplicate(id);
  }

  @Post(":id/apply-template/:templateId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "record",
    ownerPath: ["database", "space", "ownerId"],
  })
  @ApiOperation({ summary: "Apply a template to an existing record" })
  @ApiParam({ name: "id", type: String })
  @ApiParam({ name: "templateId", type: String })
  @ApiResponse({ status: 200, description: "Template applied successfully.", type: RecordResponseDto })
  @ApiResponse({ status: 404, description: "Record or template not found." })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner." })
  applyTemplate(@Param("id") id: string, @Param("templateId") templateId: string) {
    return this.recordService.applyTemplate(id, templateId);
  }
}
