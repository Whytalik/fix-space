"use client";

import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/actions/button";
import { forgotPassword } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useState } from "react";
import { useTranslations } from "next-intl";

type ForgotPasswordFormProps = {
  onBack: () => void;
};

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const t = useTranslations("Auth");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotErrors, setForgotErrors] = useState<string[]>([]);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotErrors([]);
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (err) {
      setForgotErrors(parseApiErrors(err));
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <AuthPageShell
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordSubtitle")}
      footerText={t("remembered")}
      footerLinkHref="#"
      footerLinkText={t("backToSignIn")}
      onFooterLinkClick={onBack}
    >
      {forgotSent ? (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-ink-secondary leading-relaxed">
            {t("resetEmailDesc")} <span className="text-ink font-medium">{forgotEmail}</span> {t("resetEmailDesc2")}
          </p>
          <Button variant="secondary" onClick={onBack}>
            {t("backToSignIn")}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleForgot} className="flex flex-col gap-4">
          <FormField
            id="forgot-email"
            label={t("email")}
            type="email"
            autoComplete="email"
            required
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder={t("placeholderEmail")}
          />
          <FormErrors errors={forgotErrors} />
          <Button type="submit" loading={forgotLoading} className="mt-1">
            {forgotLoading ? t("sending") : t("sendResetLink")}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
}
