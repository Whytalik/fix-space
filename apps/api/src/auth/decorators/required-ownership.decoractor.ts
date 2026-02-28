import { SetMetadata } from "@nestjs/common";

export const REQUIRE_OWNERSHIP_KEY = "require_ownership";

export interface RequireOwnershipOptions {
  model: string;
  param?: string;
  ownerField?: string;
}

export const RequireOwnership = (options: RequireOwnershipOptions) => SetMetadata(REQUIRE_OWNERSHIP_KEY, options);
