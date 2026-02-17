export class Settings {
  id: string;
  userId: string;
  key: string;
  value: Record<string, unknown>;
  category: string;

  constructor(partial: Partial<Settings>) {
    Object.assign(this, partial);
  }
}
