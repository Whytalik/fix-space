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
    this.logger.debug("Recalculating formulas for record", { recordId, databaseId });

    const client = transaction ?? prisma;

    const formulas = await client.property.findMany({
      where: { databaseId, type: PropertyType.FORMULA },
    });

    if (formulas.length === 0) return;

    const context = await this.buildContext(recordId, databaseId, client);

    const updates: Array<Promise<unknown>> = [];
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

    await Promise.all(updates);
    this.logger.log("Formulas recalculated", { recordId, formulasCount: formulas.length });
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
      for (const rv of relatedValues) {
        if (!byRecord.has(rv.recordId)) byRecord.set(rv.recordId, {});
        byRecord.get(rv.recordId)![toFieldKey(rv.propertyId)] = this.coerceValue(rv.value);
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
      const num = Number(value);
      if (!isNaN(num) && value.trim() !== "") return num;
      return value;
    }
    return value;
  }
}
