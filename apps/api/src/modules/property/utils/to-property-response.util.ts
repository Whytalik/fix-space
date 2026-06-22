import type { Prisma } from "@fixspace/database";
import type { PropertyType } from "@fixspace/domain";
import { PropertyResponseDto } from "@fixspace/domain";

type PropertyWithGroup =
  | Prisma.PropertyGetPayload<{ include: { database: true; propertyGroup: true } }>
  | {
      id: string;
      name: string;
      type: string;
      databaseId: string;
      config: unknown;
      visibilityCondition?: unknown;
      position: number;
      isVisible: boolean;
      icon: string | null;
      hint: string | null;
      groupId: string | null;
      propertyGroup?: { name: string } | null;
      createdAt: Date;
      updatedAt: Date;
      isProtected: boolean;
      integrationKey?: string | null;
    };

export function toPropertyResponseDto(property: PropertyWithGroup): PropertyResponseDto {
  return new PropertyResponseDto({
    ...property,
    config: property.config as unknown as PropertyResponseDto["config"],
    visibilityCondition: property.visibilityCondition as unknown as PropertyResponseDto["visibilityCondition"],
    type: property.type as PropertyType,
    groupName: property.propertyGroup?.name ?? null,
  });
}
