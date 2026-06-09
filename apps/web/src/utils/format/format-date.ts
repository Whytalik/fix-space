import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import type { UserSettings } from "@fixspace/domain";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export type DateSettings = Pick<UserSettings, "dateFormat" | "timeFormat" | "timezone">;

export function formatDate(value: string | Date | null | undefined, settings: DateSettings, relative?: boolean): string {
  if (!value) return "";

  if (relative) {
    return dayjs.utc(value).fromNow();
  }

  const tz = settings.timezone || "UTC";
  return dayjs
    .utc(value)
    .tz(tz)
    .format(settings.dateFormat || "DD/MM/YYYY");
}

export function formatDateTime(value: string | Date | null | undefined, settings: DateSettings, relative?: boolean): string {
  if (!value) return "";

  if (relative) {
    return dayjs.utc(value).fromNow();
  }

  const tz = settings.timezone || "UTC";
  const timeFmt = settings.timeFormat === "12h" ? "hh:mm A" : "HH:mm";
  return dayjs
    .utc(value)
    .tz(tz)
    .format(`${settings.dateFormat || "DD/MM/YYYY"} ${timeFmt}`);
}
