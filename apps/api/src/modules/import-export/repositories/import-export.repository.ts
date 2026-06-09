import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@fixspace/database";
import { BaseRepository } from "@/common/utils/base.repository";
import { randomUUID } from "node:crypto";

@Injectable()
export class ImportExportRepository extends BaseRepository {
  async findDatabaseByOwner(databaseId: string, userId: string) {
    return prisma.database.findFirst({
      where: { id: databaseId, space: { ownerId: userId } },
    });
  }

  async findPropertiesByDatabase(databaseId: string) {
    return prisma.property.findMany({
      where: { databaseId },
      orderBy: { position: "asc" },
    });
  }

  async countRecords(databaseId: string) {
    return prisma.record.count({ where: { databaseId } });
  }

  async findDefaultViewLimit(databaseId: string) {
    const view = await prisma.view.findFirst({
      where: { databaseId, isDefault: true },
      select: { recordLimit: true },
    });
    return view?.recordLimit ?? null;
  }

  async findViewById(viewId: string) {
    return prisma.view.findUnique({
      where: { id: viewId },
      select: { filters: true, filterLogic: true, databaseId: true },
    });
  }

  async findRecordsWithValues(databaseId: string) {
    return prisma.record.findMany({
      where: { databaseId },
      include: { values: { include: { property: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async createRecordsBulk(
    data: Array<{
      name: string;
      databaseId: string;
      values: Array<{ propertyId: string; value: Prisma.InputJsonValue }>;
    }>,
    transaction: Prisma.TransactionClient,
  ) {
    if (data.length === 0) return 0;

    const recordData = data.map((item) => ({
      id: randomUUID(),
      name: item.name,
      databaseId: item.databaseId,
    }));

    await transaction.record.createMany({
      data: recordData,
    });

    const valueData = data.flatMap((item, index) =>
      item.values.map((propertyValue) => ({
        id: randomUUID(),
        recordId: recordData[index]!.id,
        propertyId: propertyValue.propertyId,
        value: propertyValue.value,
        computed: false,
      })),
    );

    if (valueData.length > 0) {
      await transaction.propertyValue.createMany({
        data: valueData,
      });
    }

    return recordData.length;
  }
}
