import { Injectable } from "@nestjs/common";
import { Prisma, prisma, type User } from "@nucleus/database";

@Injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<Omit<User, "passwordHash"> | null> {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, icon: true, isVerified: true, createdAt: true },
    });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    return prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}
