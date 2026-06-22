"use client";

import { PropertyType } from "@fixspace/domain";
import type { PropertyGroupResponseDto, PropertyResponseDto, VisibilityConditionDto } from "@fixspace/domain";
import { PropertyRow } from "./property-row";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface EntityWithValues {
  id: string;
  name: string;
  values?: { id: string; propertyId: string; value?: unknown }[];
}

interface PropertyListProps {
  properties: PropertyResponseDto[];
  entity: EntityWithValues;
  mode: "record" | "template";
  propertyGroups?: PropertyGroupResponseDto[];
}

function evaluateVisibility(condition: VisibilityConditionDto, properties: PropertyResponseDto[], entity: EntityWithValues): boolean {
  const dependencyProperty = properties.find((p) => p.name === condition.dependsOnPropertyName);
  if (!dependencyProperty) return true;
  const val = entity.values?.find((v) => v.propertyId === dependencyProperty.id)?.value;
  switch (condition.operator) {
    case "EQUALS":
      return val === condition.value;
    case "NOT_EQUALS":
      return val !== condition.value;
    case "EXISTS":
      return val !== null && val !== undefined && val !== "";
    case "NOT_EXISTS":
      return val === null || val === undefined || val === "";
    case "CONTAINS":
      return typeof val === "string" && val.includes(condition.value as string);
    case "IN":
      return Array.isArray(condition.value) && (condition.value as unknown[]).includes(val);
    case "NOT_IN":
      return Array.isArray(condition.value) && !(condition.value as unknown[]).includes(val);
    default:
      return true;
  }
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
    const key = p.groupName ?? "";
    if (!seen.has(key)) {
      seen.add(key);
      order.push(key);
    }
  }

  const map = new Map<string, PropertyResponseDto[]>();
  for (const key of order) map.set(key, []);
  for (const p of sorted) map.get(p.groupName ?? "")!.push(p);

  return order.map((key) => ({ name: key || null, items: map.get(key)! }));
}

function PropertyRows({
  items,
  allProperties,
  entity,
  mode,
}: {
  items: PropertyResponseDto[];
  allProperties: PropertyResponseDto[];
  entity: EntityWithValues;
  mode: "record" | "template";
}) {
  return (
    <div className="flex flex-col">
      {items.map((property) => {
        if (
          property.visibilityCondition &&
          !evaluateVisibility(property.visibilityCondition as VisibilityConditionDto, allProperties, entity)
        ) {
          return null;
        }
        const propertyValue = entity.values?.find((e) => e.propertyId === property.id);
        const value =
          property.position === 0 && property.type === PropertyType.TEXT ? propertyValue?.value || entity.name : propertyValue?.value;
        return (
          <PropertyRow key={property.id} entityId={entity.id} mode={mode} property={property} value={value} valueId={propertyValue?.id} />
        );
      })}
    </div>
  );
}

export function PropertyList({ properties, entity, mode, propertyGroups = [] }: PropertyListProps) {
  const t = useTranslations("PropertyEdit");
  const visible = properties.filter((p) => !(p.position === 0 && p.type === PropertyType.TEXT));
  const groups = groupProperties(visible);
  const hasGroups = groups.some((group) => group.name !== null);
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
    return <PropertyRows items={groups[0]?.items ?? []} allProperties={visible} entity={entity} mode={mode} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const key = group.name ?? "";
        const groupEntity = propertyGroups.find((propertyGroup) => propertyGroup.name === key) ?? null;
        const groupVisibility = groupEntity?.visibility as VisibilityConditionDto | null | undefined;

        if (groupVisibility?.dependsOnPropertyName && !evaluateVisibility(groupVisibility, visible, entity)) {
          return null;
        }

        const isCollapsed = collapsed.has(key);
        const visibleCount = group.items.filter(
          (p) => !p.visibilityCondition || evaluateVisibility(p.visibilityCondition as VisibilityConditionDto, visible, entity),
        ).length;

        if (group.name && visibleCount === 0) return null;

        return (
          <div key={key || "__ungrouped__"}>
            {group.name && (
              <button
                type="button"
                onClick={() => toggle(key)}
                className="flex items-center gap-1.5 w-full mb-1 px-1 -mx-1 py-0.5 hover:bg-hover rounded-lg transition-colors duration-150"
              >
                {isCollapsed ? <ChevronRight size={12} className="text-ink-muted" /> : <ChevronDown size={12} className="text-ink-muted" />}
                <span className="type-nav-label text-ink-secondary">{group.name === "General" ? t("general") : group.name}</span>
                {groupVisibility?.dependsOnPropertyName && <Eye size={11} className="text-accent shrink-0" />}
                <span className="type-nav-label text-ink-muted">({visibleCount})</span>
              </button>
            )}
            {!isCollapsed && <PropertyRows items={group.items} allProperties={visible} entity={entity} mode={mode} />}
          </div>
        );
      })}
    </div>
  );
}
