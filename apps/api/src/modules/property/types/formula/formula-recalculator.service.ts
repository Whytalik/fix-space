import { Injectable } from "@nestjs/common";
import { prisma, Prisma, PropertyType } from "@fixspace/database";
import { FormulaPropertyConfig, toFieldKey } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { FormulaEngine } from "./formula-engine.service";

@Injectable()
export class FormulaRecalculator {
  constructor(
    private readonly logger: AppLogger,
    private readonly formulaEngine: FormulaEngine,
  ) {
    this.logger.setContext(FormulaRecalculator.name);
  }

  async recalculate(recordId: string, databaseId: string, transaction?: Prisma.TransactionClient): Promise<void> {
    this.logger.debug("Recalculating computed properties for record", { recordId, databaseId });

    const client = transaction ?? prisma;

    const [formulas, progressProperties] = await Promise.all([
      client.property.findMany({ where: { databaseId, type: PropertyType.FORMULA } }),
      client.property.findMany({ where: { databaseId, type: PropertyType.PROGRESS } }),
    ]);

    const sourceProgressProps = progressProperties.filter((prop) => {
      const config = prop.config as any;
      return config?.mode === "source";
    });

    if (formulas.length === 0 && sourceProgressProps.length === 0) return;

    const updates: Array<Promise<unknown>> = [];

    if (formulas.length > 0) {
      const context = await this.buildContext(recordId, databaseId, client);
      for (const formula of formulas) {
        const config = formula.config as unknown as FormulaPropertyConfig;
        const result = this.formulaEngine.evaluate(config, context);

        this.logger.debug("Formula evaluated", { propertyId: formula.id, name: formula.name, result });

        updates.push(
          client.propertyValue.upsert({
            where: { recordId_propertyId: { recordId, propertyId: formula.id } },
            update: { value: result as Prisma.InputJsonValue, computed: true },
            create: { recordId, propertyId: formula.id, value: result as Prisma.InputJsonValue, computed: true },
          }),
        );
      }
    }

    for (const progressProp of sourceProgressProps) {
      const result = await this.calculateProgressRollup(recordId, progressProp, client);
      if (result !== null) {
        this.logger.debug("Progress rollup evaluated", { propertyId: progressProp.id, name: progressProp.name, result });
        updates.push(
          client.propertyValue.upsert({
            where: { recordId_propertyId: { recordId, propertyId: progressProp.id } },
            update: { value: result as Prisma.InputJsonValue, computed: true },
            create: { recordId, propertyId: progressProp.id, value: result as Prisma.InputJsonValue, computed: true },
          }),
        );
      }
    }

    await Promise.all(updates);
    this.logger.log("Computed properties recalculated", {
      recordId,
      formulasCount: formulas.length,
      progressCount: sourceProgressProps.length,
    });
  }

  private async calculateProgressRollup(
    recordId: string,
    progressProp: any,
    client: Prisma.TransactionClient | typeof prisma,
  ): Promise<number | null> {
    const config = progressProp.config as any;
    if (!config?.relationPropertyId || !config?.targetPropertyId || !config?.rollupType) {
      return null;
    }

    const relationValue = await client.propertyValue.findUnique({
      where: { recordId_propertyId: { recordId, propertyId: config.relationPropertyId } },
    });

    if (!relationValue?.value) {
      return 0;
    }

    const relatedIds = Array.isArray(relationValue.value) ? (relationValue.value as string[]) : [relationValue.value as string];

    if (relatedIds.length === 0) {
      return 0;
    }

    const targetPropDef = await client.property.findUnique({
      where: { id: config.targetPropertyId },
    });

    if (!targetPropDef) {
      return null;
    }

    const targetValues = await client.propertyValue.findMany({
      where: {
        recordId: { in: relatedIds },
        propertyId: config.targetPropertyId,
      },
    });

    const totalCount = relatedIds.length;

    switch (config.rollupType) {
      case "percent_complete": {
        let completeOptions: string[] = [];
        if (targetPropDef.type === PropertyType.STATUS && targetPropDef.config) {
          const statusConfig = targetPropDef.config as any;
          const completeCategory = statusConfig.categories?.find((c: any) => c.category === "complete");
          if (completeCategory) {
            completeOptions = completeCategory.options?.map((o: any) => o.name) ?? [];
          }
        } else if (targetPropDef.type === PropertyType.SELECT && targetPropDef.config) {
          const selectConfig = targetPropDef.config as any;
          completeOptions = selectConfig.categories?.flatMap((c: any) => c.options?.map((o: any) => o.value) ?? []) ?? [];
          completeOptions = completeOptions.filter((val) =>
            ["done", "complete", "completed", "success", "resolved", "finished", "closed"].includes(val.toLowerCase()),
          );
        }

        if (completeOptions.length === 0) {
          completeOptions = ["done", "complete", "completed", "success", "resolved", "finished", "closed"];
        }

        const completedCount = targetValues.filter((v) => {
          if (v.value === null || v.value === undefined) return false;
          const strVal = String(v.value).toLowerCase();
          return completeOptions.some((option) => option.toLowerCase() === strVal);
        }).length;

        return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      }

      case "percent_checked": {
        const checkedCount = targetValues.filter((v) => {
          return v.value === true || v.value === "true" || v.value === 1;
        }).length;
        return totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
      }

      case "average": {
        const numbers = targetValues.map((v) => Number(v.value)).filter((n) => !isNaN(n));
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        return numbers.length > 0 ? Math.round(sum / numbers.length) : 0;
      }

      case "sum": {
        const numbers = targetValues.map((v) => Number(v.value)).filter((n) => !isNaN(n));
        return numbers.reduce((acc, curr) => acc + curr, 0);
      }

      case "count": {
        return totalCount;
      }

      default:
        return null;
    }
  }

  async previewForDatabase(databaseId: string, config: FormulaPropertyConfig): Promise<{ result: unknown; isSample: boolean }> {
    const firstRecord = await prisma.record.findFirst({
      where: { databaseId, deletedAt: null },
    });

    if (!firstRecord) {
      return { result: null, isSample: true };
    }

    const context = await this.buildContext(firstRecord.id, databaseId);
    const result = this.formulaEngine.evaluate(config, context);
    return { result, isSample: false };
  }

  async buildContext(
    recordId: string,
    databaseId: string,
    client: Prisma.TransactionClient | typeof prisma = prisma,
  ): Promise<Record<string, unknown>> {
    const allProperties = await client.property.findMany({
      where: { databaseId },
      select: { id: true, type: true },
    });
    const propertyTypeMap = new Map(allProperties.map((p) => [p.id, p.type]));

    const values = await client.propertyValue.findMany({ where: { recordId } });

    const context: Record<string, unknown> = {};

    for (const v of values) {
      const propType = propertyTypeMap.get(v.propertyId);
      if (propType === PropertyType.RELATION) continue;
      context[toFieldKey(v.propertyId)] = this.coerceValue(v.value);
    }

    for (const v of values) {
      const propType = propertyTypeMap.get(v.propertyId);
      if (propType !== PropertyType.RELATION || v.value === null || v.value === undefined) continue;

      const relatedIds = Array.isArray(v.value) ? (v.value as string[]) : [v.value as string];

      if (relatedIds.length === 0) {
        context[toFieldKey(v.propertyId)] = [];
        continue;
      }

      const relatedValues = await client.propertyValue.findMany({
        where: { recordId: { in: relatedIds } },
      });

      const byRecord = new Map<string, Record<string, unknown>>();
      for (const relatedValue of relatedValues) {
        if (!byRecord.has(relatedValue.recordId)) byRecord.set(relatedValue.recordId, {});
        byRecord.get(relatedValue.recordId)![toFieldKey(relatedValue.propertyId)] = this.coerceValue(relatedValue.value);
      }

      context[toFieldKey(v.propertyId)] = relatedIds.map((id) => byRecord.get(id) ?? {});
    }

    return context;
  }

  private coerceValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const parsedNumber = Number(value);
      if (!isNaN(parsedNumber) && value.trim() !== "") return parsedNumber;
      return value;
    }
    return value;
  }
}
