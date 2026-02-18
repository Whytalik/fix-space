import { Exclude, Expose } from 'class-transformer';

export type JsonValue =
  | string
  | number
  | boolean
  | { [key: string]: JsonValue }
  | JsonValue[]
  | null;

@Exclude()
export class SettingsResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  key: string;

  @Expose()
  value: JsonValue;

  @Expose()
  category: string;

  constructor(partial: Partial<SettingsResponseDto>) {
    Object.assign(this, partial);
  }
}
