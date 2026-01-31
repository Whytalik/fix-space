import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { UpdateUserDto } from '@nucleus/domain';
import { hashPassword } from '../common/utils/password';

@Injectable()
export class UserService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        settingsConfig: true,
      },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        settingsConfig: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const data: Record<string, unknown> = {};

    if (updateUserDto.username) {
      data.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      data.passwordHash = await hashPassword(updateUserDto.password);
    }

    if (updateUserDto.settingsConfig !== undefined) {
      data.settingsConfig = updateUserDto.settingsConfig;
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        settingsConfig: true,
      },
    });
  }

  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await prisma.user.delete({ where: { id } });
  }
}
