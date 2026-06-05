import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CreateTemplatePropertyValueDto, UpdateTemplatePropertyValueDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "../../core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "../../core/auth/guards/resource-owner.guard";
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
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "templatePropertyValue",
    ownerPath: ["template", "database", "space", "ownerId"],
  })
  findOne(@Param("id") id: string) {
    return this.templatePropertyValueService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "templatePropertyValue",
    ownerPath: ["template", "database", "space", "ownerId"],
  })
  update(
    @Param("id") id: string,
    @Body()
    dto: UpdateTemplatePropertyValueDto,
  ) {
    return this.templatePropertyValueService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "templatePropertyValue",
    ownerPath: ["template", "database", "space", "ownerId"],
  })
  remove(@Param("id") id: string) {
    return this.templatePropertyValueService.remove(id);
  }
}
