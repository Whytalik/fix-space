"use client";

import { useAppContext } from "@/context/app-context";
import { Check, ChevronDown, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SpaceSwitcher() {
  const { space, spaces, setSpace } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-surface"
      >
        <span className="text-base leading-none shrink-0">{space.icon ?? "🌐"}</span>
        <span className="text-[13px] font-semibold text-ink truncate">{space.name}</span>
        <ChevronDown
          size={13}
          className={`text-ink-secondary ml-auto shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-[3px] bg-canvas/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-elevated border border-stroke rounded-xl shadow-lg overflow-hidden">
            <div className="p-1.5 flex flex-col gap-0.5">
              {spaces.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSpace(s);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-surface text-left"
                >
                  <span className="text-base leading-none shrink-0">{s.icon ?? "🌐"}</span>
                  <span className="text-[13px] text-ink truncate flex-1">{s.name}</span>
                  {s.id === space.id && <Check size={13} className="text-accent shrink-0" />}
                </button>
              ))}
            </div>
            <div className="border-t border-stroke p-1.5">
              <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-surface text-left">
                <Pencil size={13} className="text-ink-secondary shrink-0" />
                <span className="text-[13px] text-ink-secondary">Edit space</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
