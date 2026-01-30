import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';

@Injectable()
export class SystemUserProvider {
  private cachedUser: any = null;

  async get() {
    if (!this.cachedUser) {
      this.cachedUser = await prisma.user.findFirst({
        where: { isSystem: true },
      });
    }
    return this.cachedUser;
  }
}
