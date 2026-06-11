"use client";

import type { UserResponseDto, UserSettings } from "@fixspace/domain";
import { useAppContext } from "@/context/app-context";
import { changePassword, updateMe } from "@/lib/api/user";
import { updateUserSettings } from "@/lib/api/settings";
import { parseApiError } from "@/lib/api/client";
import { AvatarUpload } from "@/components/ui/primitives/display/avatar-upload";
import { Button } from "@/components/ui/primitives/actions/button";
import { FormField } from "@/components/ui/form/form-field";
import { Combobox } from "@/components/ui/primitives/inputs/combobox";
import { Select } from "@/components/ui/primitives/inputs/select";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";
import { useUserSettingsQuery } from "@/hooks/api/use-user-settings-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface ProfileSettingsProps {
  compact?: boolean;
}

const TIMEZONE_OPTIONS = (() => {
  const raw =
    typeof Intl !== "undefined" && "supportedValuesOf" in Intl
      ? (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf("timeZone")
      : ["UTC", "Europe/Kyiv", "Europe/London", "America/New_York", "America/Chicago", "America/Los_Angeles", "Asia/Tokyo"];

  const normalized = raw.map((timezone) => (timezone === "Europe/Kiev" ? "Europe/Kyiv" : timezone));
  if (!normalized.includes("Europe/Kyiv")) normalized.push("Europe/Kyiv");

  return [...new Set(normalized)].map((timezone) => ({ value: timezone, label: timezone }));
})();

export function ProfileSettings({ compact = false }: ProfileSettingsProps) {
  const t = useTranslations("ProfileSettingsComp");
  const { user, updateUser } = useAppContext();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"general" | "security" | "datetime">("general");

  const [username, setUsername] = useState(user?.username ?? "");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState(false);

  const { data: fetchedUserSettings } = useUserSettingsQuery();
  const [datetimeForm, setDatetimeForm] = useState<UserSettings | null>(null);
  const [datetimeSuccess, setDatetimeSuccess] = useState(false);
  const [datetimeError, setDatetimeError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedUserSettings && !datetimeForm) setDatetimeForm(fetchedUserSettings);
  }, [fetchedUserSettings, datetimeForm]);

  const { mutate: saveDatetime, isPending: isSavingDatetime } = useMutation({
    mutationFn: (data: Partial<UserSettings>) => updateUserSettings(data),
    onSuccess: (updated) => {
      setDatetimeForm(updated);
      setDatetimeSuccess(true);
      setDatetimeError(null);
      queryClient.invalidateQueries({ queryKey: ["settings", "user"] });
    },
    onError: (error) => {
      setDatetimeError(parseApiError(error));
      setDatetimeSuccess(false);
    },
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (newUsername: string) => updateMe({ username: newUsername }),
    onSuccess: (updated) => {
      updateUser(updated);
      setGeneralSuccess(true);
      setGeneralError(null);
    },
    onError: (error) => {
      setGeneralError(parseApiError(error));
      setGeneralSuccess(false);
    },
  });

  function handleUpdateProfile() {
    if (!username.trim() || username === user?.username) return;
    setGeneralError(null);
    setGeneralSuccess(false);
    updateProfile(username.trim());
  }

  const { mutate: changeUserPassword, isPending: isChangingPassword } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => changePassword(data),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      setPasswordError(parseApiError(error));
      setPasswordSuccess(false);
    },
  });

  function handleChangePassword() {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t("allFieldsRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsNotMatch"));
      return;
    }
    changeUserPassword({ currentPassword, newPassword });
  }

  function handleAvatarUpdate(updated: UserResponseDto) {
    updateUser(updated);
  }

  const tabClass = (tab: "general" | "security" | "datetime") =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
      activeTab === tab ? "border-accent text-accent" : "border-transparent text-ink-secondary hover:text-ink hover:border-stroke"
    }`;

  return (
    <div className={compact ? "" : "max-w-lg"}>
      {user && (
        <div className="mb-6 flex items-center gap-4">
          <AvatarUpload
            username={user.username}
            icon={user.icon ?? null}
            size="md"
            onUpdate={handleAvatarUpdate}
            changeLabel={t("changeAvatar")}
            removeLabel={t("removePhoto")}
          />
          {!compact && (
            <div>
              <p className="font-semibold text-ink">{user.username}</p>
              <p className="text-sm text-ink-secondary">{user.email}</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-6 flex border-b border-stroke">
        <button type="button" className={tabClass("general")} onClick={() => setActiveTab("general")}>
          {t("general")}
        </button>
        <button type="button" className={tabClass("datetime")} onClick={() => setActiveTab("datetime")}>
          {t("datetime")}
        </button>
        <button type="button" className={tabClass("security")} onClick={() => setActiveTab("security")}>
          {t("security")}
        </button>
      </div>

      {activeTab === "general" && (
        <div className="flex flex-col gap-4">
          <FormField
            id="username"
            label={t("username")}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setGeneralSuccess(false);
              setGeneralError(null);
            }}
            placeholder={t("placeholderUsername")}
          />
          {generalError && <p className="text-sm text-error">{generalError}</p>}
          {generalSuccess && <p className="text-sm text-success">{t("profileUpdated")}</p>}
          <div className="flex justify-end">
            <Button onClick={handleUpdateProfile} disabled={isUpdating || !username.trim() || username === user?.username}>
              {isUpdating ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "datetime" && datetimeForm && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("timeFormat")}</label>
            <div className="flex gap-2">
              {(["12h", "24h"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setDatetimeForm((prev) => (prev ? { ...prev, timeFormat: format } : prev))}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors duration-150 ${
                    datetimeForm.timeFormat === format
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-stroke bg-surface text-ink-secondary hover:border-stroke-subtle hover:bg-hover hover:text-ink"
                  }`}
                >
                  {format === "12h" ? t("timeFormat12h") : t("timeFormat24h")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("dateFormat")}</label>
            <Select
              value={datetimeForm.dateFormat}
              onChange={(e) => setDatetimeForm((prev) => (prev ? { ...prev, dateFormat: e.target.value } : prev))}
              options={[
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                { value: "DD.MM.YYYY", label: "DD.MM.YYYY" },
                { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
                { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-secondary">{t("timezone")}</label>
            <Combobox
              options={TIMEZONE_OPTIONS}
              value={datetimeForm.timezone}
              onChange={(value) => setDatetimeForm((prev) => (prev ? { ...prev, timezone: value } : prev))}
              placeholder={t("placeholderTimezone")}
            />
          </div>

          {datetimeError && <p className="text-sm text-error">{datetimeError}</p>}
          {datetimeSuccess && <p className="text-sm text-success">{t("profileUpdated")}</p>}
          <div className="flex justify-end">
            <Button onClick={() => saveDatetime(datetimeForm)} disabled={isSavingDatetime}>
              {isSavingDatetime ? t("saving") : t("saveChanges")}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="flex flex-col gap-4">
          <FormField
            id="current-password"
            label={t("currentPassword")}
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordError(null);
              setPasswordSuccess(false);
            }}
            placeholder={t("placeholderCurrentPassword")}
          />
          <FormField
            id="new-password"
            label={t("newPassword")}
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError(null);
              setPasswordSuccess(false);
            }}
            placeholder={t("placeholderNewPassword")}
          />
          <FormField
            id="confirm-password"
            label={t("confirmPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError(null);
              setPasswordSuccess(false);
            }}
            placeholder={t("placeholderConfirmPassword")}
          />
          {passwordError && <p className="text-sm text-error">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-success">{t("passwordChanged")}</p>}
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? t("changing") : t("changePassword")}
            </Button>
          </div>

          <hr className="my-2 border-stroke" />

          <div className="flex flex-col gap-2">
            <h3 className="type-body font-semibold text-error">{t("dangerZone")}</h3>
            <p className="text-sm text-ink-secondary">{t("deleteAccountDesc")}</p>
            <div className="pt-1">
              <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                {t("deleteAccount")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteAccountModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}
