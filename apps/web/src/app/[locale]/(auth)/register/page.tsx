"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/actions/button";
import { GoogleIcon } from "@/components/ui/icons/google-icon";
import { register } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useState } from "react";
import { RegisterSuccess } from "./_components/register-success";
import { Header } from "@/components/layout/header/landing/header";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleGoogleRegister() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/auth/google`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await register({
        email,
        username,
        password,
        timezone,
      });
      setSuccess(true);
    } catch (error) {
      setErrors(parseApiErrors(error));
    } finally {
      setLoading(false);
    }
  }

  const content = success ? (
    <RegisterSuccess email={email} />
  ) : (
    <AuthPageShell
      title={t("createAccount")}
      subtitle={t("createAccountSubtitle")}
      footerText={t("alreadyHaveAccount")}
      footerLinkHref="/login"
      footerLinkText={t("signIn")}
    >
      <div className="flex flex-col gap-2">
        <Button type="button" variant="secondary" leftIcon={<GoogleIcon />} onClick={handleGoogleRegister} className="w-full">
          {t("signUpWithGoogle")}
        </Button>
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-stroke" />
          <span className="type-hint text-ink-muted">{t("orContinueWith")}</span>
          <div className="flex-1 h-px bg-stroke" />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          <FormField
            id="username"
            label={t("username")}
            type="text"
            autoComplete="nickname"
            required
            minLength={3}
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("placeholderUsername")}
            hint={t("usernameHint")}
          />
          <FormField
            id="password"
            label={t("password")}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("placeholderPassword")}
            hint={t("passwordHint")}
          />
          <FormErrors errors={errors} />
          <Button type="submit" loading={loading} className="mt-1">
            {loading ? t("creatingAccount") : t("createAccountBtn")}
          </Button>
        </form>
      </div>
    </AuthPageShell>
  );

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">{content}</main>
      <Footer />
    </div>
  );
}
