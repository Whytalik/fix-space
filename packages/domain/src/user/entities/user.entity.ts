import type { ContentBlock } from "../../content-block-library/entities/content-block.entity";
import type { Space } from "../../space/entities/space.entity";

export class User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  icon?: string;
  isVerified: boolean;
  createdAt: Date;

  spaces?: Space[];
  contentBlockLibrary?: ContentBlock[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
