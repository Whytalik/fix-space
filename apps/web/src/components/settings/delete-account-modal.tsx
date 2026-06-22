"use client";

import { ModalShell } from "@/components/ui/overlays/modal-shell";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/actions/button";
import { useAppContext } from "@/context/app-context";
import { deleteMe } from "@/lib/api/user";
import { parseApiError } from "@/lib/api/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const t = useTranslations("ProfileSettingsComp");
  const { clearSession } = useAppContext();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteMe({ password: password || undefined });
      clearSession();
    } catch (error) {
      setError(parseApiError(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleClose() {
    if (isDeleting) return;
    setPassword("");
    setError(null);
    onClose();
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={t("deleteAccountModalTitle")}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            {isDeleting ? t("deleting") : t("confirmDelete")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="type-body text-ink-secondary">{t("deleteAccountWarning")}</p>
        <FormField
          id="delete-account-password"
          label={t("deleteAccountPasswordLabel")}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          placeholder={t("deleteAccountPasswordPlaceholder")}
          hint={t("deleteAccountPasswordHint")}
        />
        {error && <p className="type-hint text-error">{error}</p>}
      </div>
    </ModalShell>
  );
}
