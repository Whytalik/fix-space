import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { UpdateUserDto } from '@nucleus/domain';
import { hashPassword } from '../common/utils/password';

@Injectable()
export class UserService {
  async findAll() {
    return prisma.user.findMany();
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
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

    const { password, ...restDto } = updateUserDto;

    const data = {
      ...restDto,
      ...(password && { passwordHash: await hashPassword(password) }),
    };

    return prisma.user.update({
      where: { id },
      data,
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
