import { Module } from "@nestjs/common";
import { DuplicateTemplateUseCase } from "./providers/duplicate-template.usecase";
import { TemplateController } from "./template.controller";
import { TemplateRepository } from "./template.repository";
import { TemplateService } from "./template.service";

@Module({
  controllers: [TemplateController],
  providers: [TemplateService, TemplateRepository, DuplicateTemplateUseCase],
  exports: [TemplateService, TemplateRepository, DuplicateTemplateUseCase],
})
export class TemplateModule {}
