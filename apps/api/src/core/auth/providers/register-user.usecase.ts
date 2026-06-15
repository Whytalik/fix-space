import { ConflictException, Injectable } from "@nestjs/common";
import { prisma } from "@fixspace/database";
import { DEFAULT_USER_SETTINGS, RegisterUserDto } from "@fixspace/domain";
import { AppLogger } from "@/common/logger/app-logger.service";
import { t } from "@/common/utils/i18n.helper";
import { hashPassword } from "@/common/utils/password";
import { SettingsCategory } from "@fixspace/domain";
import { SettingsService } from "@/modules/settings/settings.service";
import { MailService } from "../../mail/mail.service";
import { TokenService } from "../token.service";

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly settingsService: SettingsService,
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
      throw new ConflictException(t("errors.USER_EMAIL_EXISTS"));
    }

    const existingByUsername = await prisma.user.findUnique({
      where: { username: registerUserDto.username },
    });

    if (existingByUsername) {
      this.logger.warn("Registration failed: username taken", {
        username: registerUserDto.username,
      });
      throw new ConflictException(t("errors.USER_USERNAME_EXISTS"));
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

    if (registerUserDto.timezone) {
      await this.settingsService.updateSettings(
        user.id,
        SettingsCategory.USER,
        { timezone: registerUserDto.timezone },
        DEFAULT_USER_SETTINGS,
      );
    }

    const verificationToken = await this.tokenService.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, user.username, verificationToken);

    this.logger.log("Verification email sent", {
      userId: user.id,
      email: user.email,
    });

    return {
      message: t("errors.REGISTRATION_SUCCESS"),
    };
  }
}
