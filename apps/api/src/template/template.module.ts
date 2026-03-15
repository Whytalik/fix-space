import { Module } from "@nestjs/common";
import { DuplicateTemplateUseCase } from "./providers/duplicate-template.usecase";
import { TemplateController } from "./template.controller";
import { TemplateService } from "./template.service";

@Module({
  controllers: [TemplateController],
  providers: [TemplateService, DuplicateTemplateUseCase],
  exports: [TemplateService, DuplicateTemplateUseCase],
})
export class TemplateModule {}
