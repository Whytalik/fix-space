"use client";

import { PropertyIcon } from "@/components/property/property-icon";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { Button } from "@/components/ui/primitives/button";
import { TabSwitcher, type TabItem } from "@/components/ui/primitives/tab-switcher";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DatabaseResponseDto, PropertyResponseDto } from "@nucleus/domain";
import { Check, ChevronRight, GripVertical, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GroupHeader, PropertyRow } from "./property-list-items";
import {
  buildFlatItems,
  flatItemsToProperties,
  moveGroupBlock,
  type FlatItem,
  type GroupItem,
  type PropItem,
} from "./property-list.utils";
import { EditTableView } from "./edit-table-view";

type PropertiesSubTab = "record" | "table";
const PROPERTIES_TABS: TabItem<PropertiesSubTab>[] = [
  { id: "record", label: "Record" },
  { id: "table", label: "Table" },
];

type EditPropertiesSectionProps = {
  properties: PropertyResponseDto[];
  databases?: DatabaseResponseDto[];
  onAddProperty: () => void;
  onEditProperty: (property: PropertyResponseDto) => void;
  onDeleteProperty: (propId: string) => void;
  onPropertiesChange: (updated: PropertyResponseDto[]) => void;
  onPropertyUpdate: (id: string, data: Partial<{ position: number; group: string | null; isVisible: boolean }>) => void;
};

export function EditPropertiesSection({
  properties,
  databases,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onPropertiesChange,
  onPropertyUpdate,
}: EditPropertiesSectionProps) {
  const [subTab, setSubTab] = useState<PropertiesSubTab>("record");
  const [flatItems, setFlatItems] = useState<FlatItem[]>(() => buildFlatItems(properties));
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupValue, setEditGroupValue] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);
  const [pendingDeletePropId, setPendingDeletePropId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const newGroupInputRef = useRef<HTMLInputElement>(null);
  const wasCollapsedRef = useRef(false);

  const prevPropsRef = useRef(properties);
  useEffect(() => {
    if (prevPropsRef.current !== properties) {
      prevPropsRef.current = properties;
      setFlatItems(buildFlatItems(properties));
    }
  }, [properties]);

  useEffect(() => {
    if (addingGroup) newGroupInputRef.current?.focus();
  }, [addingGroup]);

  const visibleItems = useMemo(() => {
    if (collapsedGroups.size === 0) return flatItems;
    const result: FlatItem[] = [];
    let collapsed = false;
    for (const item of flatItems) {
      if (item.kind === "group") {
        collapsed = collapsedGroups.has((item as GroupItem).name);
        result.push(item);
      } else if (!collapsed) {
        result.push(item);
      }
    }
    return result;
  }, [flatItems, collapsedGroups]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const verticalOnly = useMemo<Modifier>(
    () =>
      ({ transform }) => ({ ...transform, x: 0 }),
    [],
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);
    if (id.startsWith("group:")) {
      const name = id.slice("group:".length);
      wasCollapsedRef.current = collapsedGroups.has(name);
      setCollapsedGroups((prev) => new Set([...prev, name]));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const id = String(active.id);
    setActiveId(null);

    if (id.startsWith("group:")) {
      const name = id.slice("group:".length);
      if (!wasCollapsedRef.current) {
        setCollapsedGroups((prev) => {
          const next = new Set(prev);
          next.delete(name);
          return next;
        });
      }
    }

    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    let newItems: FlatItem[];

    if (activeStr.startsWith("group:")) {
      newItems = moveGroupBlock(flatItems, activeStr, overStr);
    } else {
      const oldIdx = flatItems.findIndex((i) => i.id === activeStr);
      const newIdx = flatItems.findIndex((i) => i.id === overStr);
      newItems = arrayMove(flatItems, oldIdx, newIdx);
    }

    setFlatItems(newItems);
    const updated = flatItemsToProperties(newItems);
    onPropertiesChange(updated);

    const origMap = new Map(properties.map((p) => [p.id, p]));
    for (const p of updated) {
      const orig = origMap.get(p.id);
      if (!orig) continue;
      if (orig.position !== p.position || orig.group !== p.group) {
        onPropertyUpdate(p.id, {
          ...(orig.position !== p.position ? { position: p.position } : {}),
          ...(orig.group !== p.group ? { group: p.group ?? null } : {}),
        });
      }
    }
  }

  function handleToggleCollapse(name: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleEditStart(groupId: string, currentName: string) {
    setEditingGroupId(groupId);
    setEditGroupValue(currentName);
  }

  function handleRenameGroup(oldName: string) {
    const trimmed = editGroupValue.trim();
    setEditingGroupId(null);
    if (!trimmed || trimmed === oldName) return;
    if (flatItems.some((i) => i.kind === "group" && (i as GroupItem).name === trimmed)) return;

    const newItems = flatItems.map((i) =>
      i.id === `group:${oldName}` ? { kind: "group" as const, id: `group:${trimmed}`, name: trimmed } : i,
    );
    if (collapsedGroups.has(oldName)) {
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        next.delete(oldName);
        next.add(trimmed);
        return next;
      });
    }
    setFlatItems(newItems);
    const updated = flatItemsToProperties(newItems);
    onPropertiesChange(updated);

    for (const p of updated) {
      if (p.group === trimmed && properties.find((o) => o.id === p.id)?.group === oldName) {
        onPropertyUpdate(p.id, { group: trimmed });
      }
    }
  }

  function handleDeleteGroup(name: string) {
    const orphans = flatItems.filter((i) => i.kind === "property" && ((i as PropItem).prop.group ?? "") === name);
    const newItems = [
      ...flatItems.filter(
        (i) => i.id !== `group:${name}` && !(i.kind === "property" && ((i as PropItem).prop.group ?? "") === name),
      ),
      ...orphans,
    ];
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    setFlatItems(newItems);
    const updated = flatItemsToProperties(newItems);
    onPropertiesChange(updated);

    for (const p of updated) {
      if (!p.group && properties.find((o) => o.id === p.id)?.group === name) {
        onPropertyUpdate(p.id, { group: null });
      }
    }
  }

  function handleAddGroup() {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    if (flatItems.some((i) => i.kind === "group" && (i as GroupItem).name === trimmed)) {
      setNewGroupName("");
      setAddingGroup(false);
      return;
    }
    setFlatItems((prev) => [...prev, { kind: "group", id: `group:${trimmed}`, name: trimmed }]);
    setNewGroupName("");
    setAddingGroup(false);
  }

  function handleDeleteProperty() {
    if (!pendingDeletePropId) return;
    const propId = pendingDeletePropId.slice("prop:".length);
    const newItems = flatItems.filter((i) => i.id !== pendingDeletePropId);
    setPendingDeletePropId(null);
    setFlatItems(newItems);
    onPropertiesChange(flatItemsToProperties(newItems));
    onDeleteProperty(propId);
  }

  const activeItem = flatItems.find((i) => i.id === activeId) ?? null;

  const { groupCountMap, totalProps } = useMemo(() => {
    const map = new Map<string, number>();
    let total = 0;
    for (const item of flatItems) {
      if (item.kind === "property") {
        const g = (item as PropItem).prop.group ?? "";
        map.set(g, (map.get(g) ?? 0) + 1);
        total++;
      }
    }
    return { groupCountMap: map, totalProps: total };
  }, [flatItems]);

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="type-panel-title">
            Properties
            {totalProps > 0 && <span className="ml-2 text-ink-muted font-normal text-sm">({totalProps})</span>}
          </h2>
          {subTab === "record" && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => setAddingGroup(true)}
              >
                <Plus size={13} />
                Add group
              </Button>
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={onAddProperty}>
                <Plus size={13} />
                Add property
              </Button>
            </div>
          )}
        </div>
        <TabSwitcher items={PROPERTIES_TABS} active={subTab} onChange={setSubTab} />
      </div>

      {subTab === "table" && (
        <EditTableView
          properties={properties}
          onPropertiesChange={onPropertiesChange}
          onPropertyUpdate={onPropertyUpdate}
        />
      )}

      {subTab === "record" && addingGroup && (
        <div className="mb-3 flex items-center gap-2">
          <input
            ref={newGroupInputRef}
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddGroup();
              if (e.key === "Escape") {
                setAddingGroup(false);
                setNewGroupName("");
              }
            }}
            placeholder="Group name…"
            className="field-input flex-1"
          />
          <Button size="sm" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
            <Check size={13} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setAddingGroup(false);
              setNewGroupName("");
            }}
          >
            <X size={13} />
          </Button>
        </div>
      )}

      {subTab === "record" && flatItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stroke flex items-center justify-center py-8">
          <p className="text-sm text-ink-muted">No properties yet.</p>
        </div>
      ) : subTab === "record" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[verticalOnly]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-lg border border-stroke overflow-hidden">
            <SortableContext items={visibleItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {visibleItems.map((item) => {
                if (item.kind === "group") {
                  const g = item as GroupItem;
                  return (
                    <GroupHeader
                      key={g.id}
                      item={g}
                      count={groupCountMap.get(g.name) ?? 0}
                      isCollapsed={collapsedGroups.has(g.name)}
                      isEditing={editingGroupId === g.id}
                      editValue={editGroupValue}
                      onToggleCollapse={() => handleToggleCollapse(g.name)}
                      onEditStart={() => handleEditStart(g.id, g.name)}
                      onEditChange={setEditGroupValue}
                      onEditConfirm={() => handleRenameGroup(g.name)}
                      onEditCancel={() => setEditingGroupId(null)}
                      onDelete={() => handleDeleteGroup(g.name)}
                    />
                  );
                }
                return (
                  <PropertyRow
                    key={item.id}
                    item={item as PropItem}
                    databases={databases}
                    onEdit={() => onEditProperty((item as PropItem).prop)}
                    onDelete={() => setPendingDeletePropId(item.id)}
                  />
                );
              })}
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeItem?.kind === "group" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-stroke rounded-lg shadow-md">
                <GripVertical size={14} className="text-ink-muted shrink-0" />
                <ChevronRight size={13} className="text-ink-muted shrink-0" />
                <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
                  {(activeItem as GroupItem).name}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">
                  {groupCountMap.get((activeItem as GroupItem).name) ?? 0}
                </span>
              </div>
            )}
            {activeItem?.kind === "property" && (
              <div className="flex items-center gap-2 px-3 py-3 bg-elevated border border-stroke rounded-lg shadow-md">
                <GripVertical size={14} className="text-ink-muted shrink-0" />
                <PropertyIcon type={(activeItem as PropItem).prop.type} size={14} className="text-ink-muted shrink-0" />
                <span className="text-sm text-ink flex-1">{(activeItem as PropItem).prop.name}</span>
                <span className="text-xs text-ink-muted font-mono">{(activeItem as PropItem).prop.type}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : null}
      {pendingDeletePropId && (
        <ConfirmDialog
          title="Delete property?"
          description="This will permanently remove the property and all its values. This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDeleteProperty}
          onCancel={() => setPendingDeletePropId(null)}
        />
      )}
    </section>
  );
}
