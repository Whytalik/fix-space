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
      const sortedFormulas = this.sortFormulasByDependency(formulas);

      for (const formula of sortedFormulas) {
        const config = formula.config as unknown as FormulaPropertyConfig;
        const result = this.formulaEngine.evaluate(config, context);

        this.logger.debug("Formula evaluated", { propertyId: formula.id, name: formula.name, result });

        // Update context so formulas evaluated later can read this fresh value
        context[toFieldKey(formula.id)] = result;

        updates.push(
          client.propertyValue.upsert({
            where: { recordId_propertyId: { recordId, propertyId: formula.id } },
            update: { value: result as Prisma.InputJsonValue, computed: true },
            create: { recordId, propertyId: formula.id, value: result as Prisma.InputJsonValue, computed: true },
          }),
        );
      }
    }

    const rollupResults = await Promise.all(
      sourceProgressProps.map(async (progressProp) => {
        const result = await this.calculateProgressRollup(recordId, progressProp, client);
        return { progressProp, result };
      }),
    );

    for (const { progressProp, result } of rollupResults) {
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

  private sortFormulasByDependency<T extends { id: string; config: unknown }>(formulas: Array<T>): Array<T> {
    if (formulas.length <= 1) return formulas;

    const formulaFieldKeys = new Map(formulas.map((formula) => [toFieldKey(formula.id), formula.id]));

    // outgoing[B] = set of formula IDs that depend on B and must be evaluated after it
    const outgoing = new Map(formulas.map((formula) => [formula.id, new Set<string>()]));
    const inDegree = new Map(formulas.map((formula) => [formula.id, 0]));

    for (const formula of formulas) {
      const config = formula.config as FormulaPropertyConfig;
      const expression = config.expression ?? "";
      for (const [fieldKey, prerequisiteId] of formulaFieldKeys) {
        if (prerequisiteId !== formula.id && expression.includes(fieldKey)) {
          outgoing.get(prerequisiteId)!.add(formula.id);
          inDegree.set(formula.id, (inDegree.get(formula.id) ?? 0) + 1);
        }
      }
    }

    // Kahn's topological sort
    const formulaById = new Map(formulas.map((formula) => [formula.id, formula]));
    const queue = formulas.filter((formula) => inDegree.get(formula.id) === 0);
    const sorted: Array<T> = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);
      for (const dependentId of outgoing.get(current.id)!) {
        const newDegree = (inDegree.get(dependentId) ?? 0) - 1;
        inDegree.set(dependentId, newDegree);
        if (newDegree === 0) {
          queue.push(formulaById.get(dependentId)!);
        }
      }
    }

    // Append any remaining formulas (cycle case) in original order
    if (sorted.length < formulas.length) {
      const sortedIds = new Set(sorted.map((formula) => formula.id));
      for (const formula of formulas) {
        if (!sortedIds.has(formula.id)) {
          sorted.push(formula);
        }
      }
    }

    return sorted;
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

    const relatedIds = (Array.isArray(relationValue.value) ? (relationValue.value as unknown[]) : [relationValue.value]).filter(
      (id): id is string => typeof id === "string",
    );

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
          const completeCategory = statusConfig.categories?.find((category: any) => category.category === "complete");
          if (completeCategory) {
            completeOptions = completeCategory.options?.map((option: any) => option.name) ?? [];
          }
        } else if (targetPropDef.type === PropertyType.SELECT && targetPropDef.config) {
          const selectConfig = targetPropDef.config as any;
          completeOptions =
            selectConfig.categories?.flatMap((category: any) => category.options?.map((option: any) => option.value) ?? []) ?? [];
          completeOptions = completeOptions.filter((val) =>
            ["done", "complete", "completed", "success", "resolved", "finished", "closed"].includes(val.toLowerCase()),
          );
        }

        if (completeOptions.length === 0) {
          completeOptions = ["done", "complete", "completed", "success", "resolved", "finished", "closed"];
        }

        const completedCount = targetValues.filter((targetValue) => {
          if (targetValue.value === null || targetValue.value === undefined) return false;
          const strVal = String(targetValue.value).toLowerCase();
          return completeOptions.some((option) => option.toLowerCase() === strVal);
        }).length;

        return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      }

      case "percent_checked": {
        const checkedCount = targetValues.filter((targetValue) => {
          return targetValue.value === true || targetValue.value === "true" || targetValue.value === 1;
        }).length;
        return totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
      }

      case "average": {
        const numbers = targetValues.map((targetValue) => Number(targetValue.value)).filter((num) => !isNaN(num));
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        return numbers.length > 0 ? Math.round(sum / numbers.length) : 0;
      }

      case "sum": {
        const numbers = targetValues.map((targetValue) => Number(targetValue.value)).filter((num) => !isNaN(num));
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
    const propertyTypeMap = new Map(allProperties.map((property) => [property.id, property.type]));

    const values = await client.propertyValue.findMany({ where: { recordId } });

    const context: Record<string, unknown> = {};
    const relationValues: typeof values = [];

    for (const value of values) {
      const propType = propertyTypeMap.get(value.propertyId);

      if (propType === PropertyType.RELATION) {
        if (value.value !== null && value.value !== undefined) {
          relationValues.push(value);
        } else {
          context[toFieldKey(value.propertyId)] = [];
        }
        continue;
      }

      // Exclude stale formula values — recalculate() writes fresh values into context after each evaluation
      if (propType === PropertyType.FORMULA) continue;

      context[toFieldKey(value.propertyId)] = this.coerceValue(value.value);
    }

    if (relationValues.length > 0) {
      const allRelatedIds = new Set<string>();
      const relationIdMap = new Map<string, string[]>();

      for (const value of relationValues) {
        const relatedIds = (Array.isArray(value.value) ? (value.value as unknown[]) : [value.value]).filter(
          (id): id is string => typeof id === "string",
        );
        relationIdMap.set(value.propertyId, relatedIds);
        for (const id of relatedIds) allRelatedIds.add(id);
      }

      const allRelatedValues =
        allRelatedIds.size > 0
          ? await client.propertyValue.findMany({
              where: { recordId: { in: Array.from(allRelatedIds) } },
            })
          : [];

      const byRecord = new Map<string, Record<string, unknown>>();
      for (const relatedValue of allRelatedValues) {
        if (!byRecord.has(relatedValue.recordId)) byRecord.set(relatedValue.recordId, {});
        byRecord.get(relatedValue.recordId)![toFieldKey(relatedValue.propertyId)] = this.coerceValue(relatedValue.value);
      }

      for (const value of relationValues) {
        const relatedIds = relationIdMap.get(value.propertyId)!;
        context[toFieldKey(value.propertyId)] = relatedIds.map((id) => byRecord.get(id) ?? {});
      }
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
