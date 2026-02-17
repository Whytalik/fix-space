import { Controller, Get, Patch } from '@nestjs/common';
import { UpdateSettingsDto, User } from '@nucleus/domain';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { SettingsService } from './categories/space-settings.service';

@Controller('settings')
export class SettingsController {
}
