"use client";

import { useMemo } from "react";
import { useUserSettingsQuery } from "../api/use-user-settings-query";
import { formatDate, formatDateTime, type DateSettings } from "@/utils/format/format-date";
import { DEFAULT_USER_SETTINGS } from "@fixspace/domain";

export function useDateFormat() {
  const { data: settings } = useUserSettingsQuery();
  const resolved = settings ?? DEFAULT_USER_SETTINGS;

  return useMemo(
    () => ({
      formatDate: (value: string | Date | null | undefined, settingsOverride?: Partial<DateSettings>, relative?: boolean) =>
        formatDate(value, { ...resolved, ...settingsOverride }, relative),
      formatDateTime: (value: string | Date | null | undefined, settingsOverride?: Partial<DateSettings>, relative?: boolean) =>
        formatDateTime(value, { ...resolved, ...settingsOverride }, relative),
      settings: resolved,
    }),
    [resolved],
  );
}
