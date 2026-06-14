export function toFieldKey(propertyId: string): string {
  return "field_" + propertyId.replace(/-/g, "_");
}
