import type { ViewResponseDto } from "../../view/dto/responses/view-response.dto";

export interface LocalViewConfig extends Partial<Omit<ViewResponseDto, "id" | "databaseId" | "createdAt" | "updatedAt">> {
  id: string;
  name: string;
}

export interface LinkedDatabaseComponentData {
  databaseId: string;
  databaseName?: string;
  viewName?: string; // Legacy: used to select global view by name
  activeViewId?: string;
  views?: LocalViewConfig[];
  localView?: LocalViewConfig; // Legacy: used for the single local view
}
