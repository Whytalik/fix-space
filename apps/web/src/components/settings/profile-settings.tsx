"use client";

import { useAppContext } from "@/context/app-context";
import { changePassword, updateMe } from "@/lib/api/user";
import { parseApiError } from "@/lib/api/client";
import { Avatar } from "@/components/ui/primitives/avatar";
import { Button } from "@/components/ui/primitives/button";
import { FormField } from "@/components/ui/form/form-field";
import { useState } from "react";

interface ProfileSettingsProps {
  compact?: boolean;
}

export function ProfileSettings({ compact = false }: ProfileSettingsProps) {
  const { user, updateUser } = useAppContext();

  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  const [username, setUsername] = useState(user?.username ?? "");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function handleUpdateProfile() {
    if (!username.trim() || username === user?.username) return;
    setGeneralError(null);
    setGeneralSuccess(false);
    setIsUpdating(true);
    try {
      const updated = await updateMe({ username: username.trim() });
      updateUser(updated);
      setGeneralSuccess(true);
    } catch (err) {
      setGeneralError(parseApiError(err));
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(parseApiError(err));
    } finally {
      setIsChangingPassword(false);
    }
  }

  const tabClass = (tab: "general" | "security") =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
      activeTab === tab
        ? "border-accent text-accent"
        : "border-transparent text-ink-secondary hover:text-ink hover:border-stroke"
    }`;

  return (
    <div className={compact ? "" : "max-w-lg"}>
      {!compact && user && (
        <div className="mb-6 flex items-center gap-4">
          <Avatar initial={user.username[0] ?? ""} size="md" />
          <div>
            <p className="font-semibold text-ink">{user.username}</p>
            <p className="text-sm text-ink-secondary">{user.email}</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex border-b border-stroke">
        <button className={tabClass("general")} onClick={() => setActiveTab("general")}>
          General
        </button>
        <button className={tabClass("security")} onClick={() => setActiveTab("security")}>
          Security
        </button>
      </div>

      {activeTab === "general" && (
        <div className="flex flex-col gap-4">
          <FormField
            id="username"
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setGeneralSuccess(false);
              setGeneralError(null);
            }}
            placeholder="Enter username"
          />
          {generalError && <p className="text-sm text-red-500">{generalError}</p>}
          {generalSuccess && <p className="text-sm text-green-500">Profile updated successfully.</p>}
          <div className="flex justify-end">
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating || !username.trim() || username === user?.username}
            >
              {isUpdating ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="flex flex-col gap-4">
          <FormField
            id="current-password"
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordError(null);
              setPasswordSuccess(false);
            }}
            placeholder="Enter current password"
          />
          <FormField
            id="new-password"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError(null);
              setPasswordSuccess(false);
            }}
            placeholder="Enter new password"
          />
          <FormField
            id="confirm-password"
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError(null);
              setPasswordSuccess(false);
            }}
            placeholder="Confirm new password"
          />
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-500">Password changed successfully.</p>}
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? "Changing…" : "Change password"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
