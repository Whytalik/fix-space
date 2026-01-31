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
    return await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        isSystem,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  async findSystemUser() {
    return await prisma.user.findFirst({
      where: { isSystem: true },
    });
  }
}
