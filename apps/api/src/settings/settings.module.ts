import { Module } from '@nestjs/common';
import { UserSettingsService } from './categories/user-settings.service';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [UserSettingsService],
})
export class SettingsModule { }
