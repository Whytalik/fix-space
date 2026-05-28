import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateTemplateDto, UpdateTemplateDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { DuplicateTemplateUseCase } from "./providers/duplicate-template.usecase";
import { TemplateService } from "./template.service";

@Controller("templates")
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private readonly duplicateTemplateUseCase: DuplicateTemplateUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    dto: CreateTemplateDto,
  ) {
    return this.templateService.create(dto.databaseId, dto, userId);
  }

  @Get()
  findAll(
    @Query("databaseId")
    databaseId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templateService.findAll(databaseId, userId);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templateService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
    @Body()
    dto: UpdateTemplateDto,
  ) {
    return this.templateService.update(id, dto, userId);
  }

  @Post(":id/duplicate")
  duplicate(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.duplicateTemplateUseCase.execute(id, userId);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templateService.remove(id, userId);
  }
}
