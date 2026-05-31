"use client";

import { resendVerification } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ResendVerificationFormProps = {
  initialEmail?: string;
};

export function ResendVerificationForm({ initialEmail = "" }: ResendVerificationFormProps) {
  const t = useTranslations("Verify");
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resendVerification(email);
      setSuccess(true);
    } catch (err) {
      const errors = parseApiErrors(err);
      setError(errors[0] || t("failedGeneric"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-4 text-sm rounded-md bg-success-bg border border-success text-ink">{t("resendSuccess")}</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4 max-w-sm mx-auto text-left">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-bold text-ink">{t("resendTitle")}</h2>
        <p className="text-sm text-ink-secondary">{t("resendDescription")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="resend-email" className="type-field-label">
          {t("emailLabel")}
        </label>
        <input
          id="resend-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="field-input"
          disabled={loading}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-sm font-medium transition-colors bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50"
      >
        {loading ? "..." : t("resendButton")}
      </button>
    </form>
  );
}
