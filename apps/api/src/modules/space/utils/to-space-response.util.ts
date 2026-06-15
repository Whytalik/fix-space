import type { Prisma } from "@fixspace/database";
import { SpaceResponseDto } from "@fixspace/domain";
import type { sectionsInclude } from "../constants/space.constants";

type SpaceWithSections = Prisma.SpaceGetPayload<{ include: typeof sectionsInclude }>;

export function toSpaceResponseDto(space: SpaceWithSections): SpaceResponseDto {
  return new SpaceResponseDto({
    ...space,
    databases: (space.databases ?? []) as SpaceResponseDto["databases"],
    sections: (space.sections ?? []) as SpaceResponseDto["sections"],
  });
}
