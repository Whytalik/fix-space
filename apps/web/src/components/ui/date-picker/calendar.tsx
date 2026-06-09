"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import dayjs from "dayjs";
import { cn } from "@/utils/ui/cn";

interface CalendarProps {
  date: Date;
  onChange: (date: Date) => void;
}

export function Calendar({ date, onChange }: CalendarProps) {
  const [viewDate, setViewDate] = useState(date);
  const startOfMonth = dayjs(viewDate).startOf("month");
  const endOfMonth = dayjs(viewDate).endOf("month");
  const startDate = startOfMonth.startOf("week");
  const endDate = endOfMonth.endOf("week");

  const days = [];
  let day = startDate;
  while (day.isBefore(endDate)) {
    days.push(day);
    day = day.add(1, "day");
  }

  return (
    <div className="p-2 w-full">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setViewDate(dayjs(viewDate).subtract(1, "month").toDate())} className="p-1 hover:bg-surface rounded-md">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold">{dayjs(viewDate).format("MMMM YYYY")}</span>
        <button onClick={() => setViewDate(dayjs(viewDate).add(1, "month").toDate())} className="p-1 hover:bg-surface rounded-md">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-muted mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const isSelected = d.isSame(date, "day");
          const isCurrentMonth = d.isSame(viewDate, "month");
          return (
            <button
              key={d.toISOString()}
              onClick={() => onChange(d.toDate())}
              className={cn(
                "h-7 w-7 rounded-full text-sm flex items-center justify-center transition-colors",
                !isCurrentMonth && "text-ink-muted/50",
                isSelected ? "bg-accent text-white" : "hover:bg-surface",
              )}
            >
              {d.format("D")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
