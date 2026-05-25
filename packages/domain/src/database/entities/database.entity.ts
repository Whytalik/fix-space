import type { Section } from "../../section/entities/section.entity";
import type { Space } from "../../space/entities/space.entity";

export class Database {
  id: string;
  spaceId: string;
  sectionId?: string;
  name: string;
  title: string;
  type?: string;
  key?: string;
  icon?: string;
  recordLimit?: number;
  isPreset: boolean;
  isLocked: boolean;
  useDefaultTemplate: boolean;
  enableStats: boolean;
  createdAt: Date;
  updatedAt: Date;
  config?: Record<string, unknown>;

  space?: Space;
  section?: Section;

  constructor(partial: Partial<Database>) {
    Object.assign(this, partial);
  }
}
