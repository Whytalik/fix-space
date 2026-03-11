import { SetMetadata } from "@nestjs/common";

export const REQUIRE_OWNERSHIP_KEY = "require_ownership";

export const PRISMA_MODEL_NAMES = new Set([
  "user",
  "refreshToken",
  "emailVerificationToken",
  "settings",
  "space",
  "section",
  "database",
  "property",
  "record",
  "propertyValue",
] as const);

export type PrismaModelKey = typeof PRISMA_MODEL_NAMES extends Set<infer T> ? T : never;

export interface RequireOwnershipOptions {
  model: PrismaModelKey;
  param?: string;
  ownerField?: string;
}

export const RequireOwnership = (options: RequireOwnershipOptions) => SetMetadata(REQUIRE_OWNERSHIP_KEY, options);
