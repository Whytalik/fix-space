"use client";

import { IconDisplay, IconPicker } from "@/components/ui/icon-picker";
import { useAppContext } from "@/context/app-context";
import { useDatabaseContext } from "@/context/database-context";
import { updateDatabase } from "@/lib/api/database";
import { Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RecordModal } from "./record-modal";

const INPUT_CLASS =
  "w-full rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors duration-150 placeholder:text-ink-muted";

function EditDatabaseModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { database, applyDatabaseUpdate } = useDatabaseContext();
  const { updateDatabaseInSpace } = useAppContext();
  const [icon, setIcon] = useState(database?.icon ?? "");
  const [title, setTitle] = useState(database?.title ?? "");
  const [name, setName] = useState(database?.name ?? "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showIconPicker) {
          setShowIconPicker(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, showIconPicker]);

  async function handleSave() {
    if (!database) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateDatabase(database.spaceId, database.id, {
        icon: icon || undefined,
        title,
        name,
      });
      applyDatabaseUpdate(updated);
      updateDatabaseInSpace(updated);
      onSaved();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!mounted || !database) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-105 overflow-hidden rounded-2xl border border-stroke bg-elevated shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
          <h2 className="text-base font-bold text-ink">Edit database</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Icon
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker((v) => !v)}
                className="flex items-center gap-2.5 w-full rounded-lg border border-stroke bg-canvas px-3 py-2 text-sm text-ink hover:border-accent transition-colors duration-150"
              >
                {icon ? (
                  <span className="flex items-center gap-2">
                    <IconDisplay value={icon} size={18} />
                    <span className="text-ink-secondary text-xs">
                      {icon.startsWith("icon:") ? icon.slice(5) : icon}
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-muted">Choose an icon…</span>
                )}
              </button>
              {showIconPicker && (
                <div className="absolute top-full left-0 mt-1 z-60">
                  <IconPicker
                    value={icon}
                    onChange={(val) => {
                      setIcon(val);
                      setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Title
            </label>
            <input
              type="text"
              className={INPUT_CLASS}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Display title"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
              Name
              <span className="ml-1.5 normal-case font-normal text-ink-muted">(identifier)</span>
            </label>
            <input
              type="text"
              className={INPUT_CLASS}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. trading-journal"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stroke px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg font-medium text-ink-secondary bg-surface hover:bg-elevated hover:text-ink transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !name.trim()}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function DatabaseHeader() {
  const { database, properties, refresh } = useDatabaseContext();
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  if (!database) return null;

  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <IconDisplay value={database.icon || "📄"} size={36} />
        <h1 className="text-2xl font-bold text-ink">{database.title || database.name}</h1>
      </div>

      <div className="flex items-center gap-2 pt-1 shrink-0">
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-ink-secondary bg-surface border border-stroke hover:bg-elevated hover:text-ink transition-colors duration-150"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
        >
          <Plus size={13} />
          Add Item
        </button>
      </div>

      {showEdit && (
        <EditDatabaseModal
          onClose={() => setShowEdit(false)}
          onSaved={() => setShowEdit(false)}
        />
      )}

      {showAdd && (
        <RecordModal
          databaseId={database.id}
          properties={properties}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
