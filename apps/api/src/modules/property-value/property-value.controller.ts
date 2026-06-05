import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CreatePropertyValueDto, UpdatePropertyValueDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { RequireOwnership } from "../../core/auth/decorators/required-ownership.decorator";
import { ResourceOwnerGuard } from "../../core/auth/guards/resource-owner.guard";
import { PropertyValueService } from "./property-value.service";

@Controller("values")
export class PropertyValueController {
  constructor(private readonly propertyValueService: PropertyValueService) {}

  @Post()
  create(@CurrentUser("userId") userId: string, @Body() createPropertyValueDto: CreatePropertyValueDto) {
    return this.propertyValueService.create(createPropertyValueDto.recordId, createPropertyValueDto, userId);
  }

  @Get()
  findAll(@Query("recordId") recordId: string, @CurrentUser("userId") userId: string) {
    return this.propertyValueService.findAll(recordId, userId);
  }

  @Get(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "propertyValue",
    ownerPath: ["record", "database", "space", "ownerId"],
  })
  findOne(@Param("id") id: string) {
    return this.propertyValueService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "propertyValue",
    ownerPath: ["record", "database", "space", "ownerId"],
  })
  update(@Param("id") id: string, @Body() updatePropertyValueDto: UpdatePropertyValueDto) {
    return this.propertyValueService.update(id, updatePropertyValueDto);
  }

  @Delete(":id")
  @UseGuards(ResourceOwnerGuard)
  @RequireOwnership({
    model: "propertyValue",
    ownerPath: ["record", "database", "space", "ownerId"],
  })
  remove(@Param("id") id: string) {
    return this.propertyValueService.remove(id);
  }
}
