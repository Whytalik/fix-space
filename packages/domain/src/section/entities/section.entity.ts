import { Database } from "../../database/entities/database.entity";
import { Space } from "../../space/entities/space.entity";

export class Section {
  id: string;
  spaceId: string;
  name: string;
  position: number;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;

  space?: Space;
  databases?: Database[];

  constructor(partial: Partial<Section>) {
    Object.assign(this, partial);
  }
}
