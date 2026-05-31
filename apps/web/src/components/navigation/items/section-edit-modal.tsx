"use client";

import { ColorPicker } from "@/components/ui/color-picker/color-picker";
import { IconDisplay } from "@/components/ui/icons/icon-display";
import { IconPicker } from "@/components/ui/icons/icon-picker";
import { Button } from "@/components/ui/primitives/actions/button";
import { useAppContext } from "@/context/app-context";
import { useEscape } from "@/hooks/useEscape";
import { useMutation } from "@/hooks/useMutation";
import { updateSpace } from "@/lib/api/space";
import type { SectionResponseDto } from "@fixspace/domain";
import { Smile, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SectionEditModalProps = {
  section: SectionResponseDto;
  onClose: () => void;
  onSaved: () => void;
};

export function SectionEditModal({ section, onClose, onSaved }: SectionEditModalProps) {
  const { space, updateSpaceInList } = useAppContext();

  const [editName, setEditName] = useState(section.name);
  const [editIcon, setEditIcon] = useState(section.icon ?? "");
  const [editColor, setEditColor] = useState(section.color ?? "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  useEscape(
    useCallback(() => {
      if (showIconPicker) setShowIconPicker(false);
      else if (showColorPicker) setShowColorPicker(false);
      else onClose();
    }, [showIconPicker, showColorPicker, onClose]),
  );

  const { mutate: saveEdit, isLoading: isSaving } = useMutation(async () => {
    if (!space) return;
    const updated = await updateSpace(space.id, {
      sectionOperations: [
        {
          operation: "UPDATE",
          id: section.id,
          update: {
            name: editName.trim(),
            icon: editIcon.trim() || undefined,
            color: editColor,
          },
        },
      ],
    });
    updateSpaceInList(updated);
  });

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    const ok = await saveEdit();
    if (ok) onSaved();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={onClose}
    >
      <div
        className="w-105 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">Edit Section</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                {editIcon ? <IconDisplay value={editIcon} size={18} /> : <Smile size={15} />}
              </button>
              {showIconPicker && (
                <IconPicker
                  value={editIcon}
                  onChange={(val) => {
                    setEditIcon(val);
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
                {editColor ? (
                  <span className="w-full h-full rounded-lg" style={{ backgroundColor: editColor }} />
                ) : (
                  <span className="w-4 h-4 rounded-sm border-2 border-dashed border-ink-muted" />
                )}
              </button>
              {showColorPicker && (
                <ColorPicker
                  value={editColor}
                  onChange={setEditColor}
                  onClose={() => setShowColorPicker(false)}
                  anchorEl={colorButtonRef.current}
                />
              )}
            </div>
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              placeholder="Section name"
              className="flex-1 bg-surface border border-stroke rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
            />
          </div>
          <Button
            className="w-full"
            loading={isSaving}
            disabled={!editName.trim() || isSaving}
            onClick={handleSaveEdit}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
