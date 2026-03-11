"use client";

import { AddDatabaseModal } from "@/components/database/add-database-modal";
import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { useModal } from "@/hooks/useModal";
import { useMutation } from "@/hooks/useMutation";
import { updateSpace } from "@/lib/api/space";
import { Button } from "@/components/ui/primitives/button";
import { FolderPlus, LayoutGrid, Smile, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function SidebarActions() {
  const { space, updateSpaceInList } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const addDatabase = useModal();

  function handleClose() {
    setIsOpen(false);
    setName("");
    setIcon("");
    setColor("");
    setShowIconPicker(false);
    setShowColorPicker(false);
  }

  useEscape(
    useCallback(() => {
      if (!isOpen) return;
      if (showIconPicker) setShowIconPicker(false);
      else if (showColorPicker) setShowColorPicker(false);
      else handleClose();
    }, [isOpen, showIconPicker, showColorPicker]),
  );

  const { mutate: createSection, isLoading: isCreating } = useMutation(async () => {
    if (!space) return;
    const updated = await updateSpace(space.id, {
      sectionOperations: [
        {
          operation: "CREATE",
          create: {
            name: name.trim(),
            icon: icon.trim() || undefined,
            color: color.trim() || undefined,
          },
        },
      ],
    });
    updateSpaceInList(updated);
  });

  async function handleCreate() {
    if (!name.trim()) return;
    const ok = await createSection();
    if (ok) handleClose();
  }

  function handleAddDatabase(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    addDatabase.open();
  }

  return (
    <div className="flex flex-col gap-0.5 pb-3 border-b border-stroke">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink-secondary hover:bg-surface hover:text-ink transition-colors duration-150 w-full"
      >
        <FolderPlus size={14} className="shrink-0" />
        <span>Add section</span>
      </button>
      <button
        onClick={(e) => {
          handleAddDatabase(e);
        }}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink-secondary hover:bg-surface hover:text-ink transition-colors duration-150 w-full"
      >
        <LayoutGrid size={14} className="shrink-0" />
        <span>Add database</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
            onClick={handleClose}
          >
            <div
              className="w-105 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                  New Section
                </span>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X size={13} />
                </Button>
              </div>
              <div className="px-4 pb-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  <div>
                    <button
                      ref={iconButtonRef}
                      type="button"
                      onClick={() => {
                        setShowIconPicker((v) => !v);
                        setShowColorPicker(false);
                      }}
                      title="Choose icon"
                      className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center text-ink-secondary hover:border-accent focus:outline-none focus:border-accent transition-colors"
                    >
                      {icon ? <IconDisplay value={icon} size={18} /> : <Smile size={15} />}
                    </button>
                    {showIconPicker && (
                      <IconPicker
                        value={icon}
                        onChange={(val) => {
                          setIcon(val);
                          setShowIconPicker(false);
                        }}
                        onClose={() => setShowIconPicker(false)}
                        anchorEl={iconButtonRef.current}
                      />
                    )}
                  </div>
                  <div>
                    <button
                      ref={colorButtonRef}
                      type="button"
                      onClick={() => {
                        setShowColorPicker((v) => !v);
                        setShowIconPicker(false);
                      }}
                      title="Choose color"
                      className="w-9.5 h-9.5 bg-surface border border-stroke rounded-lg flex items-center justify-center hover:border-accent focus:outline-none focus:border-accent transition-colors overflow-hidden"
                    >
                      {color ? (
                        <span className="w-full h-full rounded-lg" style={{ backgroundColor: color }} />
                      ) : (
                        <span className="w-4 h-4 rounded-sm border-2 border-dashed border-ink-muted" />
                      )}
                    </button>
                    {showColorPicker && (
                      <ColorPicker
                        value={color}
                        onChange={setColor}
                        onClose={() => setShowColorPicker(false)}
                        anchorEl={colorButtonRef.current}
                      />
                    )}
                  </div>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="Section name"
                    className="flex-1 bg-surface border border-stroke rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
                  />
                </div>
                <Button
                  className="w-full"
                  loading={isCreating}
                  disabled={!name.trim() || isCreating}
                  onClick={handleCreate}
                >
                  {isCreating ? "Creating..." : "Add section"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {addDatabase.isOpen && (
        <AddDatabaseModal spaceId={space!.id} onClose={addDatabase.close} onSaved={addDatabase.close} />
      )}
    </div>
  );
}
