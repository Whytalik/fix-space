"use client";

import { useState, useRef } from "react";
import { Calendar } from "./calendar";
import { TimePicker } from "./time-picker";
import { useFloatingPanel } from "@/hooks/ui/use-floating-panel";
import { getPopoverStyle } from "@/utils/ui/popover";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
interface DatePickerPopupProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  includeTime?: boolean;
}

export function DatePickerPopup({ value, onChange, onClose, anchorEl, includeTime }: DatePickerPopupProps) {
  const [date, setDate] = useState(() => {
    if (value) {
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed.toDate() : new Date();
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useFloatingPanel(containerRef, onClose, anchorEl);

  const portalStyle = anchorEl ? getPopoverStyle(anchorEl) : undefined;

  const handleSave = () => {
    onChange(dayjs(date).toISOString());
    onClose();
  };

  const handleClear = () => {
    onChange(null);
    onClose();
  };

  const content = (
    <div ref={containerRef} style={portalStyle} className="z-50 bg-elevated border border-stroke rounded-lg shadow-lg w-64">
      <Calendar date={date} onChange={setDate} />
      {includeTime && (
        <TimePicker
          value={dayjs(date).format("HH:mm")}
          onChange={(time) =>
            setDate(
              dayjs(date)
                .set("hour", parseInt(time.split(":")[0] ?? "0"))
                .set("minute", parseInt(time.split(":")[1] ?? "0"))
                .toDate(),
            )
          }
        />
      )}
      <div className="flex gap-2 p-2 border-t border-stroke">
        <button
          type="button"
          onClick={() => setDate(new Date())}
          className="flex-1 text-xs py-1 hover:bg-surface rounded-md transition-colors duration-150"
        >
          Today
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 text-xs py-1 hover:bg-surface rounded-md text-error transition-colors duration-150"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 text-xs py-1 bg-accent text-white rounded-md transition-colors duration-150"
        >
          Save
        </button>
      </div>
    </div>
  );

  return anchorEl ? createPortal(content, document.body) : content;
}
