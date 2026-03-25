import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateDatabaseDto, UpdateDatabaseDto } from "@nucleus/domain";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { DatabaseService } from "./database.service";
import { DuplicateDatabaseUseCase } from "./providers/duplicate-database.usecase";

@Controller("databases")
export class DatabaseController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly duplicateDatabaseUseCase: DuplicateDatabaseUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser("userId")
    userId: string,
    @Body()
    createDatabaseDto: CreateDatabaseDto,
  ) {
    return this.databaseService.create(createDatabaseDto.spaceId, createDatabaseDto, userId);
  }

  @Get()
  findAll(
    @Query("spaceId")
    spaceId: string,
    @CurrentUser("userId")
    userId: string,
  ) {
    return this.databaseService.findAll(spaceId, userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.databaseService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string,
    @Body()
    updateDatabaseDto: UpdateDatabaseDto,
  ) {
    return this.databaseService.update(id, updateDatabaseDto, userId);
  }

  @Post(":id/duplicate")
  duplicate(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.duplicateDatabaseUseCase.execute(id, userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("userId") userId: string) {
    return this.databaseService.remove(id, userId);
  }
}
