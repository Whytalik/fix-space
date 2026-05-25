export class PropertyGroup {
  id: string;
  databaseId: string;
  name: string;
  position: number;
  visibility: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
