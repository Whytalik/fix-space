import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateTemplatePropertyValueDto, UpdateTemplatePropertyValueDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { TemplatePropertyValueService } from "./template-property-value.service";

@Controller("template-values")
export class TemplatePropertyValueController {
  constructor(private readonly templatePropertyValueService: TemplatePropertyValueService) {}

  @Post()
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    dto: CreateTemplatePropertyValueDto,
  ) {
    return this.templatePropertyValueService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query("templateId")
    templateId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templatePropertyValueService.findAll(templateId, userId);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templatePropertyValueService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
    @Body()
    dto: UpdateTemplatePropertyValueDto,
  ) {
    return this.templatePropertyValueService.update(id, dto, userId);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.templatePropertyValueService.remove(id, userId);
  }
}
