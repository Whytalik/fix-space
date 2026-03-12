import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { CreateRecordDto, UpdateRecordDto } from "@nucleus/domain";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RecordService } from "./record.service";

@Controller("records")
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    createRecordDto: CreateRecordDto,
  ) {
    return this.recordService.create(createRecordDto.databaseId, createRecordDto, userId);
  }

  @Get()
  findAll(
    @Query("databaseId")
    databaseId: string,
    @Query("page", new ParseIntPipe({ optional: true }))
    page: number | undefined,
    @Query("pageSize", new ParseIntPipe({ optional: true }))
    pageSize: number | undefined,
    @CurrentUser("userId")
    userId: string,
  ) {
    if (page !== undefined && pageSize !== undefined) {
      return this.recordService.findAllPaged(databaseId, userId, page, pageSize);
    }
    return this.recordService.findAll(databaseId, userId);
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

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.recordService.remove(id, userId);
  }
}
