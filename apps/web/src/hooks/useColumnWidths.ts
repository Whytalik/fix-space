import { useCallback, useEffect, useRef, useState } from "react";
import { loadColumnWidths, saveColumnWidths } from "@/lib/utils/db-view-storage";

const DEFAULT_WIDTH = 140;
const MIN_WIDTH = 80;

export function useColumnWidths(databaseId: string) {
  const [widths, setWidths] = useState<Record<string, number>>(() => (databaseId ? loadColumnWidths(databaseId) : {}));
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  useEffect(() => {
    if (!databaseId) return;
    const saved = loadColumnWidths(databaseId);
    setWidths(saved);
    widthsRef.current = saved;
  }, [databaseId]);
  const minWidthsRef = useRef<Record<string, number>>({});

  const getWidth = useCallback((propId: string) => widths[propId] ?? DEFAULT_WIDTH, [widths]);

  const initializeWidths = useCallback((measurements: Record<string, number>) => {
    minWidthsRef.current = { ...minWidthsRef.current, ...measurements };
    setWidths((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const [id, w] of Object.entries(measurements)) {
        if (!(id in prev)) {
          next[id] = w;
          changed = true;
        }
      }
      if (!changed) return prev;
      widthsRef.current = next;
      return next;
    });
  }, []);

  const getHandleProps = useCallback(
    (propId: string) => ({
      onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        const el = e.currentTarget;
        el.setPointerCapture(e.pointerId);
        const startX = e.clientX;
        const thEl = el.closest("th") as HTMLElement | null;
        const startWidth = thEl?.offsetWidth ?? widthsRef.current[propId] ?? DEFAULT_WIDTH;
        const minWidth = minWidthsRef.current[propId] ?? MIN_WIDTH;

        function onMove(ev: PointerEvent) {
          ev.preventDefault();
          const next = Math.max(minWidth, startWidth + ev.clientX - startX);
          widthsRef.current = { ...widthsRef.current, [propId]: next };
          setWidths(widthsRef.current);
        }

        function onUp() {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerup", onUp);
          saveColumnWidths(databaseId, widthsRef.current);
        }

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerup", onUp);
      },
    }),
    [databaseId],
  );

  return { getWidth, getHandleProps, initializeWidths };
}
