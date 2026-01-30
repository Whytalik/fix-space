import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';

@Injectable()
export class UserService {
  async create(
    email: string,
    username: string,
    hashedPassword: string,
    isSystem = false,
  ) {
    return prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        isSystem,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findSystemUser() {
    return prisma.user.findFirst({
      where: { isSystem: true },
    });
  }
}
