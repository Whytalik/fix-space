"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/button";
import { forgotPassword } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useState } from "react";

type ForgotPasswordFormProps = {
  onBack: () => void;
};

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
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
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link"
      footerText="Remembered it?"
      footerLinkHref="#"
      footerLinkText="Back to sign in"
      onFooterLinkClick={onBack}
    >
      {forgotSent ? (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-ink-secondary leading-relaxed">
            If <span className="text-ink font-medium">{forgotEmail}</span> is registered, you&apos;ll receive a password
            reset link shortly.
          </p>
          <Button variant="secondary" onClick={onBack}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleForgot} className="flex flex-col gap-4">
          <FormField
            id="forgot-email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <FormErrors errors={forgotErrors} />
          <Button type="submit" loading={forgotLoading} className="mt-1">
            {forgotLoading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
}
