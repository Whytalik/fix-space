import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { UpdateUserDto, UserResponseDto } from '@nucleus/domain';
import { AppLogger } from '../common/logger/app-logger.service';
import { hashPassword } from '../common/utils/password';

@Injectable()
export class UserService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(UserService.name);
  }

  async findAll(): Promise<UserResponseDto[]> {
    this.logger.debug('Finding all users');
    const users = await prisma.user.findMany();
    return users.map((user) => new UserResponseDto(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    this.logger.debug('Finding user by id', { id });
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });
    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    this.logger.debug('Finding user by email', { email });
    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
    });
    return new UserResponseDto(user);
  }

  async findByEmailOrNull(email: string): Promise<UserResponseDto | null> {
    this.logger.debug('Finding user by email (null if not found)', { email });
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user ? new UserResponseDto(user) : null;
  }

  async findByUsername(username: string): Promise<UserResponseDto> {
    this.logger.debug('Finding user by username', { username });
    const user = await prisma.user.findUniqueOrThrow({
      where: { username },
    });
    return new UserResponseDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
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
    return new UserResponseDto(user);
  }

  async remove(id: string): Promise<UserResponseDto> {
    this.logger.debug('Removing user', { id });

    const user = await prisma.user.delete({
      where: { id },
    });

    this.logger.log('User removed', { id });
    return new UserResponseDto(user);
  }
}