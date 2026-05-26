import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from "@nestjs/common";
import {
  CreateRecordDto,
  FilterLogic,
  RecordContentResponseDto,
  RecordFilterDto,
  RecordSortDto,
  SpaceSearchResultDto,
  UpdateRecordContentDto,
  UpdateRecordDto,
} from "@fixspace/domain";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { parseJson } from "../common/utils/parse-json";
import { FindRecordsUseCase } from "./providers/find-records.usecase";
import { GetRecordContentUseCase } from "./providers/get-record-content.usecase";
import { SearchRecordsUseCase } from "./providers/search-records.usecase";
import { UpdateRecordContentUseCase } from "./providers/update-record-content.usecase";
import { RecordService } from "./record.service";

@Controller("records")
export class RecordController {
  constructor(
    private readonly recordService: RecordService,
    private readonly findRecordsUseCase: FindRecordsUseCase,
    private readonly searchRecordsUseCase: SearchRecordsUseCase,
    private readonly getRecordContentUseCase: GetRecordContentUseCase,
    private readonly updateRecordContentUseCase: UpdateRecordContentUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    createRecordDto: CreateRecordDto,
  ) {
    return this.recordService.create(createRecordDto.databaseId, createRecordDto, userId);
  }

  @Get("search")
  search(
    @Query("spaceId") spaceId: string,
    @Query("q") q: string,
    @CurrentUser("userId") userId: string,
  ): Promise<SpaceSearchResultDto[]> {
    return this.searchRecordsUseCase.execute(spaceId, userId, q);
  }

  @Get()
  findAll(
    @Query("databaseId")
    databaseId: string,
    @Query("page", new ParseIntPipe({ optional: true }))
    page: number | undefined,
    @Query("pageSize", new ParseIntPipe({ optional: true }))
    pageSize: number | undefined,
    @Query("sort")
    sortRaw: string | undefined,
    @Query("filters")
    filtersRaw: string | undefined,
    @Query("filterLogic")
    filterLogic: FilterLogic | undefined,
    @Query("search")
    search: string | undefined,
    @CurrentUser("userId")
    userId: string,
  ) {
    const hasAdvanced =
      sortRaw !== undefined || filtersRaw !== undefined || filterLogic !== undefined || search !== undefined;

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
  findOne(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.recordService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
    @Body()
    updateRecordDto: UpdateRecordDto,
  ) {
    return this.recordService.update(id, updateRecordDto, userId);
  }

  @Get(":id/content")
  getContent(@Param("id") id: string, @CurrentUser("userId") userId: string): Promise<RecordContentResponseDto> {
    return this.getRecordContentUseCase.execute(id, userId);
  }

  @Put(":id/content")
  updateContent(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string,
    @Body() updateRecordContentDto: UpdateRecordContentDto,
  ): Promise<RecordContentResponseDto> {
    return this.updateRecordContentUseCase.execute(id, userId, updateRecordContentDto.content);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.recordService.remove(id, userId);
  }
}
