import { SetMetadata } from "@nestjs/common";
import { Prisma } from "@fixspace/database";

export const REQUIRE_OWNERSHIP_KEY = Symbol("REQUIRE_OWNERSHIP");

const toCamelCase = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);

export const PRISMA_MODEL_NAMES = new Set<string>(Object.values(Prisma.ModelName).map(toCamelCase));

export type PrismaModelKey = Uncapitalize<keyof typeof Prisma.ModelName>;

export interface RequireOwnershipOptions {
  model: PrismaModelKey;
  param?: string;
  ownerField?: string;
}

export const RequireOwnership = (options: RequireOwnershipOptions) => SetMetadata(REQUIRE_OWNERSHIP_KEY, options);
