import { prisma } from "@fixspace/database";
import type { Prisma } from "@fixspace/database";

export abstract class BaseRepository {
  async transaction<T>(callback: (transaction: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }
}
