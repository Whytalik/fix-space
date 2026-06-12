import type { Prisma } from "@fixspace/database";
import type { PropertyType } from "@fixspace/domain";
import { PropertyResponseDto } from "@fixspace/domain";

type PropertyWithDatabase =
  | Prisma.PropertyGetPayload<{ include: { database: true } }>
  | {
      id: string;
      name: string;
      type: string;
      databaseId: string;
      config: unknown;
      position: number;
      isVisible: boolean;
      icon: string | null;
      hint: string | null;
      group: string | null;
      createdAt: Date;
      updatedAt: Date;
      isProtected: boolean;
      integrationKey?: string | null;
    };

export function toPropertyResponseDto(property: PropertyWithDatabase): PropertyResponseDto {
  return new PropertyResponseDto({
    ...property,
    config: property.config as unknown as PropertyResponseDto["config"],
    type: property.type as PropertyType,
  });
}
