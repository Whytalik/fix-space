"use client";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  format?: "24h" | "12h";
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hours, minutes] = value.split(":");

  const handleHoursChange = (newHours: number) => {
    onChange(`${String(newHours).padStart(2, "0")}:${minutes}`);
  };

  const handleMinutesChange = (newMinutes: number) => {
    onChange(`${hours}:${String(newMinutes).padStart(2, "0")}`);
  };

  return (
    <div className="flex items-center gap-2 p-2 border-t border-stroke">
      <input
        type="number"
        min={0}
        max={23}
        value={hours}
        onChange={(e) => handleHoursChange(parseInt(e.target.value, 10))}
        className="w-12 text-center bg-surface rounded-md text-sm py-1"
      />
      <span>:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={minutes}
        onChange={(e) => handleMinutesChange(parseInt(e.target.value, 10))}
        className="w-12 text-center bg-surface rounded-md text-sm py-1"
      />
    </div>
  );
}
