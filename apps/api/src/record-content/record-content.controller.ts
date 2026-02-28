import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { UpdateRecordContentDto } from "@nucleus/domain";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { RecordContentService } from "./record-content.service";

@Controller("records/:recordId/content")
export class RecordContentController {
  constructor(private readonly recordContentService: RecordContentService) {}

  @Get()
  findOrCreate(
    @Param("recordId")
    recordId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.recordContentService.findOrCreate(recordId, userId);
  }

  @Put()
  upsert(
    @Param("recordId")
    recordId: string,
    @CurrentUser("userId")
    userId: string,
    @Body()
    updateRecordContentDto: UpdateRecordContentDto,
  ) {
    return this.recordContentService.upsert(recordId, updateRecordContentDto, userId);
  }

  @Delete()
  remove(
    @Param("recordId")
    recordId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.recordContentService.remove(recordId, userId);
  }
}
