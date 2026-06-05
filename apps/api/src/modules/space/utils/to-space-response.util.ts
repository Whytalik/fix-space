import type { Prisma } from "@fixspace/database";
import type { SpaceConfigDto } from "@fixspace/domain";
import { SpaceResponseDto } from "@fixspace/domain";
import type { sectionsInclude } from "../constants/space.constants";

type SpaceWithSections = Prisma.SpaceGetPayload<{ include: typeof sectionsInclude }>;

export function toSpaceResponseDto(space: SpaceWithSections | Record<string, unknown>): SpaceResponseDto {
  return new SpaceResponseDto({
    ...space,
    config: space.config as SpaceConfigDto,
    databases: (space.databases ?? []) as SpaceResponseDto["databases"],
    sections: (space.sections ?? []) as SpaceResponseDto["sections"],
  });
}
