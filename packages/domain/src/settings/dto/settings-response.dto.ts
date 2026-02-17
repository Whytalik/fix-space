import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SettingsResponseDto {
  @Expose()
  id: string;

  @Expose()
  key: string;

  @Expose()
  value: Record<string, unknown>;

  @Expose()
  category: string;

  constructor(partial: Partial<SettingsResponseDto>) {
    Object.assign(this, partial);
  }
}
