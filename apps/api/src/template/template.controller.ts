import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateTemplateDto, UpdateTemplateDto } from "@nucleus/domain";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { TemplateService } from "./template.service";

@Controller("templates")
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

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

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templateService.remove(id, userId);
  }
}
