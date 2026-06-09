import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@fixspace/database";
import { CreateViewDto, UpdateViewDto, ViewResponseDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { SettingsCategory } from "@/modules/settings/constants/settings.constants";
import { SettingsService } from "@/modules/settings/settings.service";
import { ViewRepository } from "./repositories/view.repository";
import { toViewResponseDto } from "./utils/to-view-response.util";

@Injectable()
export class ViewService {
  constructor(
    private readonly logger: AppLogger,
    private readonly viewRepo: ViewRepository,
    private readonly settingsService: SettingsService,
  ) {
    this.logger.setContext(ViewService.name);
  }

  async findAll(databaseId: string): Promise<ViewResponseDto[]> {
    this.logger.debug("Finding all views for database", { databaseId });
    const views = await this.viewRepo.findAllByDatabase(databaseId);
    return views.map(toViewResponseDto);
  }

  async findOne(id: string): Promise<ViewResponseDto> {
    this.logger.debug("Finding view", { id });
    const view = await this.viewRepo.findById(id);
    if (!view) {
      throw new NotFoundException(t("errors.VIEW_NOT_FOUND"));
    }
    return toViewResponseDto(view);
  }

  async create(databaseId: string, dto: CreateViewDto, userId: string): Promise<ViewResponseDto> {
    this.logger.debug("Creating view", { databaseId, name: dto.name });
    const count = await this.viewRepo.countByDatabase(databaseId);
    if (count >= 5) {
      throw new BadRequestException(t("errors.VIEW_LIMIT_REACHED"));
    }

    const effectiveIcon = dto.icon ?? (await this.settingsService.getDefaultIcon(userId, SettingsCategory.VIEW));

    const view = await this.viewRepo.create({
      databaseId,
      name: dto.name,
      icon: effectiveIcon,
      isLocked: dto.isLocked ?? false,
      pageSize: dto.pageSize ?? 50,
      recordLimit: dto.recordLimit,
      useDefaultTemplate: dto.useDefaultTemplate ?? true,
      defaultTemplateId: dto.defaultTemplateId,
      filters: (dto.filters as any) ?? [],
      filterLogic: dto.filterLogic ?? "AND",
      sort: (dto.sort as any) ?? [],
      groupBy: dto.groupBy,
      hiddenColumns: dto.hiddenColumns ?? [],
      columnWidths: (dto.columnWidths as any) ?? {},
      textWrap: dto.textWrap ?? false,
      searchQuery: dto.searchQuery,
    });

    this.logger.log("View created", { viewId: view.id, databaseId });
    return toViewResponseDto(view);
  }

  async update(id: string, dto: UpdateViewDto): Promise<ViewResponseDto> {
    this.logger.debug("Updating view", { id });
    const existing = await this.viewRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(t("errors.VIEW_NOT_FOUND"));
    }

    if (existing.isLocked && dto.isLocked !== false) {
      const hasFunctionalChanges =
        dto.filters !== undefined || dto.sort !== undefined || dto.groupBy !== undefined || dto.pageSize !== undefined;
      if (hasFunctionalChanges) {
        throw new ForbiddenException(t("errors.VIEW_LOCKED"));
      }
    }

    const config = (existing.config as Record<string, unknown>) ?? {};
    if (dto.groupColors) config.groupColors = dto.groupColors;
    if (dto.hiddenGroups) config.hiddenGroups = dto.hiddenGroups;
    if (dto.columnSummaries) config.columnSummaries = dto.columnSummaries;

    const updated = await this.viewRepo.update(id, {
      name: dto.name,
      icon: dto.icon,
      isLocked: dto.isLocked,
      pageSize: dto.pageSize,
      recordLimit: dto.recordLimit,
      useDefaultTemplate: dto.useDefaultTemplate,
      defaultTemplateId: dto.defaultTemplateId,
      filters: (dto.filters as unknown as Prisma.InputJsonValue) ?? undefined,
      filterLogic: dto.filterLogic,
      sort: (dto.sort as unknown as Prisma.InputJsonValue) ?? undefined,
      groupBy: dto.groupBy,
      hiddenColumns: dto.hiddenColumns,
      columnWidths: (dto.columnWidths as unknown as Prisma.InputJsonValue) ?? undefined,
      textWrap: dto.textWrap,
      searchQuery: dto.searchQuery,
      config: Object.keys(config).length > 0 ? (config as Prisma.InputJsonValue) : undefined,
    });

    this.logger.log("View updated", { id });
    return toViewResponseDto(updated);
  }

  async delete(id: string): Promise<ViewResponseDto> {
    this.logger.debug("Deleting view", { id });
    const existing = await this.viewRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(t("errors.VIEW_NOT_FOUND"));
    }

    const count = await this.viewRepo.countByDatabase(existing.databaseId);
    if (count <= 1) {
      throw new BadRequestException(t("errors.CANNOT_DELETE_LAST_VIEW"));
    }

    const deleted = await this.viewRepo.delete(id);

    this.logger.log("View deleted", { id });
    return toViewResponseDto(deleted);
  }

  async duplicate(id: string): Promise<ViewResponseDto> {
    this.logger.debug("Duplicating view", { id });
    const source = await this.viewRepo.findById(id);
    if (!source) {
      throw new NotFoundException(t("errors.VIEW_NOT_FOUND"));
    }

    const count = await this.viewRepo.countByDatabase(source.databaseId);
    if (count >= 5) {
      throw new BadRequestException(t("errors.VIEW_LIMIT_REACHED"));
    }

    const view = await this.viewRepo.create({
      databaseId: source.databaseId,
      name: `${source.name} (Copy)`,
      icon: source.icon,
      isDefault: false,
      isLocked: false,
      pageSize: source.pageSize,
      recordLimit: source.recordLimit,
      useDefaultTemplate: source.useDefaultTemplate,
      defaultTemplateId: source.defaultTemplateId,
      filters: (source.filters as any) ?? [],
      sort: (source.sort as any) ?? [],
      groupBy: source.groupBy,
      hiddenColumns: source.hiddenColumns,
      columnWidths: (source.columnWidths as any) ?? {},
      textWrap: source.textWrap,
    });

    this.logger.log("View duplicated", { sourceId: id, newId: view.id });
    return toViewResponseDto(view);
  }
}
