import type { DatabaseResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { PropertyType } from "@fixspace/domain/enums";

export type GroupItem = { kind: "group"; id: string; name: string };
export type PropItem = { kind: "property"; id: string; prop: PropertyResponseDto };
export type FlatItem = GroupItem | PropItem;

export function getConfigSummary(prop: PropertyResponseDto, databases?: DatabaseResponseDto[]): string | null {
  const c = prop.config as unknown as Record<string, unknown> | null;
  if (!c) return null;

  switch (prop.type) {
    case PropertyType.TEXT: {
      const parts: string[] = [];
      if (c.isRichText) parts.push("Rich text");
      if (c.urlHandling === "detect") parts.push("URL detect");
      if (c.urlHandling === "preview") parts.push("URL preview");
      return parts.join(" · ") || null;
    }
    case PropertyType.NUMBER: {
      const fmt = String(c.format ?? "float");
      const parts: string[] = [fmt === "currency" && c.currencySymbol ? `${c.currencySymbol} currency` : fmt];
      if ((fmt === "float" || fmt === "currency") && c.decimalPlaces !== undefined)
        parts.push(`${c.decimalPlaces} dec`);
      return parts.join(" · ");
    }
    case PropertyType.DATE: {
      const parts = [String(c.format ?? "date")];
      if (c.includeTime) parts.push(String(c.timeFormat ?? "HH:mm"));
      return parts.join(" · ");
    }
    case PropertyType.CHECKBOX:
      return c.defaultValue ? "Default: on" : null;
    case PropertyType.SELECT: {
      const cats = c.categories as Array<{ options: string[] }> | undefined;
      const count = cats?.flatMap((cat) => cat.options).length ?? 0;
      const parts: string[] = [];
      if (c.isMultiSelect) parts.push("Multi");
      parts.push(count > 0 ? `${count} option${count !== 1 ? "s" : ""}` : "No options");
      return parts.join(" · ");
    }
    case PropertyType.STATUS: {
      const cats = c.categories as Array<{ options: unknown[] }> | undefined;
      const count = cats?.flatMap((cat) => cat.options).length ?? 0;
      return count > 0 ? `${count} option${count !== 1 ? "s" : ""}` : "No options";
    }
    case PropertyType.RELATION: {
      const db = databases?.find((d) => d.id === c.relatedEntityId);
      const dbName = db ? (db.title ?? db.name) : c.relatedEntityId ? "Unknown DB" : "No database";
      const mult = c.multiple !== false ? "multiple" : "single";
      return `→ ${dbName} · ${mult}`;
    }
    case PropertyType.FORMULA: {
      const f = String(c.formula ?? "");
      return f ? (f.length > 35 ? f.slice(0, 35) + "…" : f) : "No formula";
    }
    default:
      return null;
  }
}

export function buildFlatItems(properties: PropertyResponseDto[]): FlatItem[] {
  const sorted = [...properties].sort((a, b) => a.position - b.position);

  const seen = new Set<string>();
  const groupOrder: string[] = [];
  for (const p of sorted) {
    const g = p.group ?? "";
    if (!seen.has(g)) {
      seen.add(g);
      groupOrder.push(g);
    }
  }

  const groups = new Map<string, PropertyResponseDto[]>();
  for (const g of groupOrder) groups.set(g, []);
  for (const p of sorted) groups.get(p.group ?? "")!.push(p);

  const items: FlatItem[] = [];
  for (const gName of groupOrder) {
    if (gName) items.push({ kind: "group", id: `group:${gName}`, name: gName });
    for (const p of groups.get(gName)!) {
      items.push({ kind: "property", id: `prop:${p.id}`, prop: p });
    }
  }
  return items;
}

export function moveGroupBlock(items: FlatItem[], groupId: string, overId: string): FlatItem[] {
  const groupName = groupId.slice("group:".length);
  const block = items.filter(
    (i) => i.id === groupId || (i.kind === "property" && ((i as PropItem).prop.group ?? "") === groupName),
  );
  const rest = items.filter((i) => !block.some((b) => b.id === i.id));

  let insertIdx = rest.findIndex((i) => i.id === overId);
  if (insertIdx === -1) return items;

  const activeOrigIdx = items.findIndex((i) => i.id === groupId);
  const overOrigIdx = items.findIndex((i) => i.id === overId);
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
  let pos = 0;
  let currentGroup: string | null = null;
  for (const item of items) {
    if (item.kind === "group") {
      currentGroup = item.name;
    } else {
      result.push({ ...item.prop, position: pos++, group: currentGroup });
    }
  }
  return result;
}
