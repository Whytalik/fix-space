"use client";

import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/actions/button";
import { login } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LoginForm() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await login({ email, password });
      window.location.href = "/";
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title={t("welcomeBack")}
      subtitle={t("signInSubtitle")}
      footerText={t("dontHaveAccount")}
      footerLinkHref="/register"
      footerLinkText={t("signUp")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="email"
          label={t("email")}
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholderEmail")}
        />
        <div className="flex flex-col gap-1.5">
          <FormField
            id="password"
            label={t("password")}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("placeholderPassword")}
          />
          <Link href="/forgot-password" className="self-end text-xs text-ink-secondary hover:text-accent transition-colors">
            {t("forgotPassword")}
          </Link>
        </div>
        <FormErrors errors={errors} />
        <Button type="submit" loading={loading} className="mt-1">
          {loading ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </AuthPageShell>
  );
}
