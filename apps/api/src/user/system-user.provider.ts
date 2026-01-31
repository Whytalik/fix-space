import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';

interface SystemUser {
  id: string;
  username: string;
  isSystem: boolean;
}

@Injectable()
export class SystemUserProvider {
  private cachedUser: SystemUser | null = null;

  async get() {
    if (!this.cachedUser) {
      this.cachedUser = await prisma.user.findFirst({
        where: { isSystem: true },
      });
    }
    return this.cachedUser;
  }
}
