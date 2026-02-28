"use client";

import { useAppContext } from "@/context/app-context";
import { Check, ChevronDown, Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function HeaderSpace() {
  const { space, spaces, setSpace } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!space) return null;

  return (
    <>
      <span className="text-stroke mx-1">|</span>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-surface"
      >
        <div className="w-5 h-5 rounded flex items-center justify-center text-xs bg-accent-muted border border-accent text-accent font-bold shrink-0">
          {space.icon ?? space.name[0]?.toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-ink-secondary">{space.name}</span>
        <ChevronDown size={12} className="text-ink-muted" />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-canvas/50"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="w-80 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">Spaces</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface text-ink-secondary hover:text-ink"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="px-2 pb-2 flex flex-col gap-0.5">
                {spaces.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSpace(s);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg hover:bg-surface text-left"
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm bg-accent-muted border border-accent text-accent font-bold shrink-0">
                      {s.icon ?? s.name[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-ink truncate flex-1">{s.name}</span>
                    {s.id === space.id && <Check size={14} className="text-accent shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-stroke px-2 py-2 grid grid-cols-2 gap-1">
                <button className="flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-lg hover:bg-surface">
                  <Pencil size={13} className="text-ink-secondary shrink-0" />
                  <span className="text-sm text-ink-secondary">Edit space</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-lg hover:bg-surface">
                  <Plus size={13} className="text-ink-secondary shrink-0" />
                  <span className="text-sm text-ink-secondary">New space</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
