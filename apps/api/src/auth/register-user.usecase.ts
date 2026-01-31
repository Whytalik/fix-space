import { Injectable } from '@nestjs/common';
import { prisma } from '@nucleus/database';
import { RegisterUserDto } from '@nucleus/domain';
import { InitializeUserSpaceUseCase } from 'src/space/initialize-user-space.usecase';
import { hashPassword } from '../common/utils/password';

@Injectable()
export class RegisterUserService {
  constructor(
    private readonly initializeUserSpaceUseCase: InitializeUserSpaceUseCase,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    return prisma.$transaction(async (tx) => {
      const existingByEmail = await tx.user.findUnique({
        where: { email: registerUserDto.email },
      });

      if (existingByEmail) {
        throw new Error('User with this email already exists');
      }

      const existingByUsername = await tx.user.findUnique({
        where: { username: registerUserDto.username },
      });

      if (existingByUsername) {
        throw new Error('User with this username already exists');
      }

      const passwordHash = await hashPassword(registerUserDto.password);

      const user = await tx.user.create({
        data: {
          email: registerUserDto.email,
          username: registerUserDto.username,
          passwordHash,
        },
      });

      await this.initializeUserSpaceUseCase.initialize(
        user.id,
        registerUserDto.username,
      );

      return user;
    });
  }
}
