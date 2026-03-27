import type { TemplatePropertyValue } from "../../template-property-value/entities/template-property-value.entity";

export class Template {
  id: string;
  databaseId: string;
  name: string;
  description?: string;
  icon?: string;
  isDefault: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  config?: Record<string, unknown>;
  values?: TemplatePropertyValue[];
}
