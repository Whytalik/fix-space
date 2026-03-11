import { ConflictException, Injectable } from "@nestjs/common";
import { prisma } from "@nucleus/database";
import { RegisterUserDto } from "@nucleus/domain";
import { AppLogger } from "../../common/logger/app-logger.service";
import { hashPassword } from "../../common/utils/password";
import { MailService } from "../../mail/mail.service";
import { InitializeUserSpaceUseCase } from "../../space/providers/initialize-user-space.usecase";
import { TokenService } from "../token.service";

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly initializeUserSpaceUseCase: InitializeUserSpaceUseCase,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(RegisterUserUseCase.name);
  }

  async register(registerUserDto: RegisterUserDto) {
    this.logger.debug("Registration attempt", {
      email: registerUserDto.email,
      username: registerUserDto.username,
    });

    const existingByEmail = await prisma.user.findUnique({
      where: { email: registerUserDto.email },
    });

    if (existingByEmail) {
      this.logger.warn("Registration failed: email taken", {
        email: registerUserDto.email,
      });
      throw new ConflictException("User with this email already exists");
    }

    const existingByUsername = await prisma.user.findUnique({
      where: { username: registerUserDto.username },
    });

    if (existingByUsername) {
      this.logger.warn("Registration failed: username taken", {
        username: registerUserDto.username,
      });
      throw new ConflictException("User with this username already exists");
    }

    const passwordHash = await hashPassword(registerUserDto.password);

    const user = await prisma.user.create({
      data: {
        email: registerUserDto.email,
        username: registerUserDto.username,
        passwordHash,
      },
    });

    this.logger.log("User registered", {
      userId: user.id,
      username: user.username,
    });

    await this.initializeUserSpaceUseCase.initialize(user.id, registerUserDto.username);

    const verificationToken = await this.tokenService.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, user.username, verificationToken);

    this.logger.log("Verification email sent", {
      userId: user.id,
      email: user.email,
    });

    return {
      message: "Registration successful. Please check your email to verify your account.",
    };
  }
}
