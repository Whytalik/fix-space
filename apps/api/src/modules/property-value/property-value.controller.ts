import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreatePropertyValueDto, UpdatePropertyValueDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { PropertyValueService } from "./property-value.service";

@Controller("values")
export class PropertyValueController {
  constructor(private readonly propertyValueService: PropertyValueService) {}

  @Post()
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    createPropertyValueDto: CreatePropertyValueDto,
  ) {
    return this.propertyValueService.create(createPropertyValueDto.recordId, createPropertyValueDto, userId);
  }

  @Get()
  findAll(
    @Query("recordId")
    recordId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyValueService.findAll(recordId, userId);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyValueService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
    @Body()
    updatePropertyValueDto: UpdatePropertyValueDto,
  ) {
    return this.propertyValueService.update(id, updatePropertyValueDto, userId);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyValueService.remove(id, userId);
  }
}
