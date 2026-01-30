import { Controller, Get } from '@nestjs/common';
import { SystemUserProvider } from './system-user.provider';

@Controller('user')
export class UserController {
  constructor(private readonly systemUserProvider: SystemUserProvider) {}

  @Get()
  async getSystemUser() {
    const user = await this.systemUserProvider.get();

    return {
      userId: user.id,
      username: user.username,
    };
  }
}
