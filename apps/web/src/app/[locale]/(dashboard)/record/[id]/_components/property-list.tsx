"use client";

import { PropertyType } from "@fixspace/domain/enums";
import type { PropertyResponseDto, RecordResponseDto } from "@fixspace/domain";
import { RecordPropertyRow } from "./property-display";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface RecordPropertyListProps {
  properties: PropertyResponseDto[];
  record: RecordResponseDto;
}

type PropertyGroup = {
  name: string | null;
  items: PropertyResponseDto[];
};

function groupProperties(properties: PropertyResponseDto[]): PropertyGroup[] {
  const sorted = [...properties].sort((a, b) => a.position - b.position);

  const seen = new Set<string>();
  const order: string[] = [];
  for (const p of sorted) {
    const key = p.group ?? "";
    if (!seen.has(key)) {
      seen.add(key);
      order.push(key);
    }
  }

  const map = new Map<string, PropertyResponseDto[]>();
  for (const key of order) map.set(key, []);
  for (const p of sorted) map.get(p.group ?? "")!.push(p);

  return order.map((key) => ({ name: key || null, items: map.get(key)! }));
}

function PropertyRows({ items, record }: { items: PropertyResponseDto[]; record: RecordResponseDto }) {
  return (
    <div className="flex flex-col">
      {items.map((property) => {
        const propertyValue = record.values?.find((e) => e.propertyId === property.id);
        const value =
          property.position === 0 && property.type === PropertyType.TEXT ? propertyValue?.value || record.name : propertyValue?.value;
        return <RecordPropertyRow key={property.id} recordId={record.id} property={property} value={value} valueId={propertyValue?.id} />;
      })}
    </div>
  );
}

export function RecordPropertyList({ properties, record }: RecordPropertyListProps) {
  const visible = properties.filter((p) => !(p.position === 0 && p.type === PropertyType.TEXT));
  const groups = groupProperties(visible);
  const hasGroups = groups.some((g) => g.name !== null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  if (!hasGroups) {
    return <PropertyRows items={groups[0]?.items ?? []} record={record} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const key = group.name ?? "";
        const isCollapsed = collapsed.has(key);

        return (
          <div key={key || "__ungrouped__"}>
            {group.name && (
              <button
                type="button"
                onClick={() => toggle(key)}
                className="flex items-center gap-1.5 w-full mb-1 px-1 -mx-1 py-0.5 hover:bg-hover rounded-lg transition-colors duration-150"
              >
                {isCollapsed ? <ChevronRight size={12} className="text-ink-muted" /> : <ChevronDown size={12} className="text-ink-muted" />}
                <span className="type-nav-label text-ink-secondary">{group.name}</span>
                <span className="type-nav-label text-ink-muted">({group.items.length})</span>
              </button>
            )}
            {!isCollapsed && <PropertyRows items={group.items} record={record} />}
          </div>
        );
      })}
    </div>
  );
}
