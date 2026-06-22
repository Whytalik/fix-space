"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/actions/button";
import { GoogleIcon } from "@/components/ui/icons/google-icon";
import { login } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/layout/header/landing/header";
import { Footer } from "@/components/layout/footer";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function handleGoogleLogin() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/auth/google`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await login({ email, password });
      window.location.href = "/";
    } catch (error) {
      setErrors(parseApiErrors(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <AuthPageShell
          title={t("welcomeBack")}
          subtitle={t("signInSubtitle")}
          footerText={t("dontHaveAccount")}
          footerLinkHref="/register"
          footerLinkText={t("signUp")}
        >
          <div className="flex flex-col gap-2">
            <Button type="button" variant="secondary" leftIcon={<GoogleIcon />} onClick={handleGoogleLogin} className="w-full">
              {t("signInWithGoogle")}
            </Button>
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-stroke" />
              <span className="type-hint text-ink-muted">{t("orContinueWith")}</span>
              <div className="flex-1 h-px bg-stroke" />
            </div>
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
                <Link
                  href="/forgot-password"
                  className="self-end text-xs text-ink-secondary hover:text-accent transition-colors duration-150"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <FormErrors errors={errors} />
              <Button type="submit" loading={loading} className="mt-1">
                {loading ? t("signingIn") : t("signIn")}
              </Button>
            </form>
          </div>
        </AuthPageShell>
      </main>
      <Footer />
    </div>
  );
}
