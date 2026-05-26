import type { Prisma } from "@fixspace/database";
import type { SpaceConfigDto } from "@fixspace/domain";
import { SpaceResponseDto } from "@fixspace/domain";
import type { sectionsInclude } from "../space.constants";

type SpaceWithSections = Prisma.SpaceGetPayload<{ include: typeof sectionsInclude }>;

export function toSpaceResponseDto(space: SpaceWithSections | Record<string, unknown>): SpaceResponseDto {
  return new SpaceResponseDto({
    ...space,
    config: space.config as unknown as SpaceConfigDto,
    databases: (space.databases ?? []) as unknown as SpaceResponseDto["databases"],
    sections: (space.sections ?? []) as unknown as SpaceResponseDto["sections"],
  });
}
