export interface RelationProperty {
  relatedEntityId: string;
  multiple: boolean;

}

export const DEFAULT_RELATION_PROPERTY = {
  relatedEntityId: '',
  multiple: true,
} satisfies RelationProperty;
