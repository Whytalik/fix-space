"use client";

import { PropertyIcon } from "../../_components/properties/ui/property-icon";
import { ConfirmDialog } from "@/components/ui/overlays/confirm-dialog";
import { Button } from "@/components/ui/primitives/actions/button";
import { createPropertyGroup, deletePropertyGroup, getPropertyGroups, updatePropertyGroup } from "@/lib/api/property-group";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIContext } from "@/context/ui-context";
import { GroupSettingsModal } from "./group-settings-modal";
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
import type { DatabaseResponseDto, PropertyResponseDto } from "@fixspace/domain";
import { Check, ChevronRight, GripVertical, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildFlatItems, flatItemsToProperties, moveGroupBlock, type FlatItem, type GroupItem, type PropItem } from "./property-list.utils";
import { GroupHeader, PropertyRow } from "./property-list-items";
import { useTranslations } from "next-intl";

type EditPropertiesSectionProps = {
  databaseId: string;
  properties: PropertyResponseDto[];
  databases?: DatabaseResponseDto[];
  isLocked?: boolean;
  isKey?: boolean;
  onAddProperty: () => void;
  onEditProperty: (property: PropertyResponseDto) => void;
  onDeleteProperty: (propId: string) => void;
  onPropertiesChange: (updated: PropertyResponseDto[]) => void;
  onPropertyUpdate: (id: string, data: Partial<{ position: number; groupId: string | null; isVisible: boolean }>) => void;
};

export function EditPropertiesSection({
  databaseId,
  properties,
  databases,
  isLocked,
  isKey,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onPropertiesChange,
  onPropertyUpdate,
}: EditPropertiesSectionProps) {
  const [flatItems, setFlatItems] = useState<FlatItem[]>(() => buildFlatItems(properties));
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupValue, setEditGroupValue] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);
  const [pendingDeletePropId, setPendingDeletePropId] = useState<string | null>(null);
  const [pendingDeleteGroupName, setPendingDeleteGroupName] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const newGroupInputRef = useRef<HTMLInputElement>(null);
  const wasCollapsedRef = useRef(false);
  const t = useTranslations("PropertyEdit");
  const [settingsGroupName, setSettingsGroupName] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showError } = useUIContext();

  const { data: propertyGroups = [] } = useQuery({
    queryKey: queryKeys.propertyGroups.all(databaseId),
    queryFn: () => getPropertyGroups(databaseId),
    enabled: !!databaseId,
  });

  const { mutateAsync: createGroupMutation } = useMutation({
    mutationFn: (name: string) => createPropertyGroup(databaseId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.propertyGroups.all(databaseId) }),
  });

  const { mutate: renameGroupMutation } = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updatePropertyGroup(id, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.propertyGroups.all(databaseId) }),
    onError: showError,
  });

  const { mutate: deleteGroupMutation } = useMutation({
    mutationFn: (id: string) => deletePropertyGroup(id),
    onError: showError,
  });

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

  const visibleItems: FlatItem[] = (() => {
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
  })();

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

    const activeId = String(active.id);
    const overId = String(over.id);

    let newItems: FlatItem[];

    if (activeId.startsWith("group:")) {
      newItems = moveGroupBlock(flatItems, activeId, overId);
    } else {
      const oldIdx = flatItems.findIndex((item) => item.id === activeId);
      const newIdx = flatItems.findIndex((item) => item.id === overId);
      newItems = arrayMove(flatItems, oldIdx, newIdx);
    }

    setFlatItems(newItems);
    const updated = flatItemsToProperties(newItems);
    onPropertiesChange(updated);

    const origMap = new Map(properties.map((property) => [property.id, property]));
    for (const property of updated) {
      const orig = origMap.get(property.id);
      if (!orig) continue;
      if (orig.position !== property.position || orig.groupName !== property.groupName) {
        const resolvedGroupId = property.groupName ? (propertyGroups.find((group) => group.name === property.groupName)?.id ?? null) : null;
        onPropertyUpdate(property.id, {
          ...(orig.position !== property.position ? { position: property.position } : {}),
          ...(orig.groupName !== property.groupName ? { groupId: resolvedGroupId } : {}),
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
    if (flatItems.some((item) => item.kind === "group" && (item as GroupItem).name === trimmed)) return;

    const existingGroup = propertyGroups.find((group) => group.name === oldName);
    if (existingGroup) {
      renameGroupMutation({ id: existingGroup.id, name: trimmed });
    }

    const newItems = flatItems.map((item) =>
      item.id === `group:${oldName}` ? { kind: "group" as const, id: `group:${trimmed}`, name: trimmed } : item,
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
    onPropertiesChange(flatItemsToProperties(newItems));
  }

  function handleDeleteGroup(name: string) {
    const existingGroup = propertyGroups.find((group) => group.name === name);
    if (existingGroup) {
      deleteGroupMutation(existingGroup.id);
    }

    const orphans = flatItems.filter((item) => item.kind === "property" && ((item as PropItem).prop.groupName ?? "") === name);
    const newItems = [
      ...flatItems.filter(
        (item) => item.id !== `group:${name}` && !(item.kind === "property" && ((item as PropItem).prop.groupName ?? "") === name),
      ),
      ...orphans,
    ];
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    setFlatItems(newItems);
    onPropertiesChange(flatItemsToProperties(newItems));
    queryClient.invalidateQueries({ queryKey: queryKeys.propertyGroups.all(databaseId) });
  }

  async function handleAddGroup() {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    if (flatItems.some((item) => item.kind === "group" && (item as GroupItem).name === trimmed)) {
      setNewGroupName("");
      setAddingGroup(false);
      return;
    }
    try {
      await createGroupMutation(trimmed);
      setFlatItems((prev) => [...prev, { kind: "group", id: `group:${trimmed}`, name: trimmed }]);
    } catch (error) {
      showError(error);
    }
    setNewGroupName("");
    setAddingGroup(false);
  }

  function handleDeleteProperty() {
    if (!pendingDeletePropId) return;
    const propId = pendingDeletePropId.slice("prop:".length);
    const newItems = flatItems.filter((item) => item.id !== pendingDeletePropId);
    setPendingDeletePropId(null);
    setFlatItems(newItems);
    onPropertiesChange(flatItemsToProperties(newItems));
    onDeleteProperty(propId);
  }

  const activeItem = flatItems.find((item) => item.id === activeId) ?? null;

  const groupCountMap = new Map<string, number>();
  let totalProps = 0;
  for (const item of flatItems) {
    if (item.kind === "property") {
      const group = (item as PropItem).prop.groupName ?? "";
      groupCountMap.set(group, (groupCountMap.get(group) ?? 0) + 1);
      totalProps++;
    }
  }

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="type-panel-title">
            {t("properties")}
            {totalProps > 0 && <span className="ml-2 text-ink-muted font-normal text-sm">({totalProps})</span>}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setAddingGroup(true)}
              disabled={isLocked}
            >
              <Plus size={13} />
              {t("addGroup")}
            </Button>
            <Button variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={onAddProperty} disabled={isLocked}>
              <Plus size={13} />
              {t("addProperty")}
            </Button>
          </div>
        </div>
      </div>

      {addingGroup && (
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
            placeholder={t("groupName")}
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

      {flatItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stroke flex items-center justify-center py-8">
          <p className="text-sm text-ink-muted">{t("noProperties")}</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[verticalOnly]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-lg border border-stroke overflow-hidden">
            <SortableContext items={visibleItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              {visibleItems.map((item) => {
                if (item.kind === "group") {
                  const groupItem = item as GroupItem;
                  const isGeneral = groupItem.name === "General";
                  const hasProtected = properties.some(
                    (p) => (p.groupName === groupItem.name || (!p.groupName && isGeneral)) && (p.isProtected || p.name === "Name"),
                  );

                  const existingGroup = propertyGroups.find((group) => group.name === groupItem.name);
                  return (
                    <GroupHeader
                      key={groupItem.id}
                      item={groupItem}
                      displayName={isGeneral ? t("general") : undefined}
                      count={groupCountMap.get(groupItem.name) ?? 0}
                      isCollapsed={collapsedGroups.has(groupItem.name)}
                      isEditing={editingGroupId === groupItem.id}
                      editValue={editGroupValue}
                      isLocked={isLocked || (isGeneral && hasProtected)}
                      hasVisibilityCondition={!!existingGroup?.visibility}
                      onToggleCollapse={() => handleToggleCollapse(groupItem.name)}
                      onEditStart={() => handleEditStart(groupItem.id, groupItem.name)}
                      onEditChange={setEditGroupValue}
                      onEditConfirm={() => handleRenameGroup(groupItem.name)}
                      onEditCancel={() => setEditingGroupId(null)}
                      onDelete={() => setPendingDeleteGroupName(groupItem.name)}
                      onSettings={() => setSettingsGroupName(groupItem.name)}
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
              <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-stroke rounded-lg shadow-md w-[400px]">
                <GripVertical size={14} className="text-ink-muted shrink-0" />
                <ChevronRight size={13} className="text-ink-muted shrink-0" />
                <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
                  {(activeItem as GroupItem).name}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">{groupCountMap.get((activeItem as GroupItem).name) ?? 0}</span>
              </div>
            )}
            {activeItem?.kind === "property" && (
              <div className="flex items-center gap-2 px-3 py-3 bg-elevated border border-stroke rounded-lg shadow-md w-[400px]">
                <GripVertical size={14} className="text-ink-muted shrink-0" />
                <PropertyIcon type={(activeItem as PropItem).prop.type} size={14} className="text-ink-muted shrink-0" />
                <span className="text-sm text-ink flex-1">{(activeItem as PropItem).prop.name}</span>
                <span className="text-xs text-ink-muted font-mono">{(activeItem as PropItem).prop.type}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
      {pendingDeletePropId && (
        <ConfirmDialog
          title={t("deleteProperty")}
          description={isKey ? t("deleteKeyPropertyDesc") : t("deletePropertyDesc")}
          confirmLabel={t("delete")}
          variant="danger"
          onConfirm={handleDeleteProperty}
          onCancel={() => setPendingDeletePropId(null)}
        />
      )}
      {pendingDeleteGroupName && (
        <ConfirmDialog
          title={t("deleteGroup")}
          description={t("deleteGroupDesc")}
          confirmLabel={t("delete")}
          variant="danger"
          onConfirm={() => {
            handleDeleteGroup(pendingDeleteGroupName);
            setPendingDeleteGroupName(null);
          }}
          onCancel={() => setPendingDeleteGroupName(null)}
        />
      )}
      {settingsGroupName && (
        <GroupSettingsModal
          groupName={settingsGroupName}
          databaseId={databaseId}
          propertyGroups={propertyGroups}
          properties={properties}
          onClose={() => setSettingsGroupName(null)}
        />
      )}
    </section>
  );
}
