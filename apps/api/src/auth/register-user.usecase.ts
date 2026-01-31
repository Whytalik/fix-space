import { ConflictException, Injectable } from '@nestjs/common';
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
    const existingByEmail = await prisma.user.findUnique({
      where: { email: registerUserDto.email },
    });

    if (existingByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingByUsername = await prisma.user.findUnique({
      where: { username: registerUserDto.username },
    });

    if (existingByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    const passwordHash = await hashPassword(registerUserDto.password);

    const user = await prisma.user.create({
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
  }
}
