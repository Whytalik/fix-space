import type { DatabaseResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain";

export type GroupItem = { kind: "group"; id: string; name: string };
export type PropItem = { kind: "property"; id: string; prop: PropertyResponseDto };
export type FlatItem = GroupItem | PropItem;

export function getConfigSummary(prop: PropertyResponseDto, databases?: DatabaseResponseDto[]): string | null {
  const config = prop.config as unknown as Record<string, unknown> | null;
  if (!config) return null;

  switch (prop.type) {
    case PropertyType.TEXT: {
      return "Rich text";
    }
    case PropertyType.NUMBER: {
      const format = String(config.format ?? "float");
      const parts: string[] = [];
      if (format === "currency" && config.currencySymbol) parts.push(`${config.currencySymbol} currency`);
      else if (format === "percentage") parts.push("Percentage (%)");
      else parts.push(format);

      if ((format === "float" || format === "currency" || format === "percentage") && config.decimalPlaces !== undefined) {
        parts.push(`${config.decimalPlaces} dec`);
      }
      if (config.prefix) parts.push(`Pre: ${config.prefix}`);
      if (config.suffix) parts.push(`Suf: ${config.suffix}`);
      return parts.join(" · ");
    }
    case PropertyType.DATE: {
      const parts = [String(config.format ?? "date")];
      if (config.includeTime) parts.push(String(config.timeFormat ?? "HH:mm"));
      return parts.join(" · ");
    }
    case PropertyType.CHECKBOX:
      return config.defaultValue ? "Default: on" : null;
    case PropertyType.SELECT: {
      const categories = config.categories as Array<{ options: string[] }> | undefined;
      const count = categories?.flatMap((category) => category.options).length ?? 0;
      const parts: string[] = [];
      if (config.isMultiSelect) parts.push("Multi");
      parts.push(count > 0 ? `${count} option${count !== 1 ? "s" : ""}` : "No options");
      return parts.join(" · ");
    }
    case PropertyType.STATUS: {
      const categories = config.categories as Array<{ options: unknown[] }> | undefined;
      const count = categories?.flatMap((category) => category.options).length ?? 0;
      return count > 0 ? `${count} option${count !== 1 ? "s" : ""}` : "No options";
    }
    case PropertyType.RELATION: {
      const db = databases?.find((database) => database.id === config.relatedEntityId);
      const databaseName = db ? db.name : config.relatedEntityId ? "Unknown DB" : "No database";
      const mult = config.multiple !== false ? "multiple" : "single";
      return `→ ${databaseName} · ${mult}`;
    }
    default:
      return null;
  }
}

export function buildFlatItems(properties: PropertyResponseDto[]): FlatItem[] {
  const sorted = [...properties].sort((a, b) => a.position - b.position);

  const seen = new Set<string>();
  const groupOrder: string[] = [];
  for (const property of sorted) {
    const group = property.groupName ?? "";
    if (!seen.has(group)) {
      seen.add(group);
      groupOrder.push(group);
    }
  }

  const groups = new Map<string, PropertyResponseDto[]>();
  for (const group of groupOrder) groups.set(group, []);
  for (const property of sorted) groups.get(property.groupName ?? "")!.push(property);

  const items: FlatItem[] = [];
  for (const gName of groupOrder) {
    if (gName) items.push({ kind: "group", id: `group:${gName}`, name: gName });
    for (const property of groups.get(gName)!) {
      items.push({ kind: "property", id: `prop:${property.id}`, prop: property });
    }
  }
  return items;
}

export function moveGroupBlock(items: FlatItem[], groupId: string, overId: string): FlatItem[] {
  const groupName = groupId.slice("group:".length);
  const block = items.filter(
    (item) => item.id === groupId || (item.kind === "property" && ((item as PropItem).prop.groupName ?? "") === groupName),
  );
  const rest = items.filter((item) => !block.some((blockItem) => blockItem.id === item.id));

  let insertIdx = rest.findIndex((item) => item.id === overId);
  if (insertIdx === -1) return items;

  const activeOrigIdx = items.findIndex((item) => item.id === groupId);
  const overOrigIdx = items.findIndex((item) => item.id === overId);
  if (overOrigIdx > activeOrigIdx) {
    insertIdx++;
    if (overId.startsWith("group:")) {
      while (insertIdx < rest.length && rest[insertIdx]?.kind === "property") {
        insertIdx++;
      }
    }
  }

  return [...rest.slice(0, insertIdx), ...block, ...rest.slice(insertIdx)];
}

export function flatItemsToProperties(items: FlatItem[]): PropertyResponseDto[] {
  const result: PropertyResponseDto[] = [];
  let position = 1;
  let currentGroup: string | null = null;
  for (const item of items) {
    if (item.kind === "group") {
      currentGroup = item.name;
    } else {
      const isProtected = item.prop.isProtected || item.prop.name === "Name";
      result.push({
        ...item.prop,
        position: position++,
        groupName: isProtected ? "General" : currentGroup,
      });
    }
  }
  return result;
}
