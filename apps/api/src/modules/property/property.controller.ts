import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreatePropertyDto, UpdatePropertyDto } from "@fixspace/domain";
import { CurrentUser } from "../../core/auth/decorators/current-user.decorator";
import { PropertyService } from "./property.service";

@Controller("properties")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    createPropertyDto: CreatePropertyDto,
  ) {
    if (!createPropertyDto.databaseId) {
      throw new BadRequestException("databaseId is required");
    }
    return this.propertyService.create(createPropertyDto.databaseId, createPropertyDto, userId);
  }

  @Get()
  findAll(
    @Query("databaseId")
    databaseId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyService.findAll(databaseId, userId);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
    @Body()
    updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(id, updatePropertyDto, userId);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.propertyService.remove(id, userId);
  }
}
