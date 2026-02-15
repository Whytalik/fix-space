import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { UpdateUserDto } from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { hashPassword } from '../common/utils/password';

@Injectable()
export class UserService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(UserService.name);
  }

  async findAll() {
    this.logger.debug('Finding all users');
    return prisma.user.findMany();
  }

  async findById(id: string) {
    this.logger.debug('Finding user by id', { id });
    return prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    this.logger.debug('Finding user by email', { email });
    return prisma.user.findUniqueOrThrow({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    this.logger.debug('Finding user by username', { username });
    return prisma.user.findUniqueOrThrow({
      where: { username },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    this.logger.debug('Updating user', { id });
    const { password, ...rest } = dto;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(password && { passwordHash: await hashPassword(password) }),
      },
    });

    this.logger.log('User updated', { id });
    return user;
  }

  async remove(id: string) {
    this.logger.debug('Removing user', { id });

    const user = await prisma.user.delete({
      where: { id },
    });

    this.logger.log('User removed', { id });
    return user;
  }
}