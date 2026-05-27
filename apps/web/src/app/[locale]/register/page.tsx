"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/button";
import { register } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useState } from "react";
import { RegisterSuccess } from "./_components/register-success";
import { Header } from "@/components/layout/header/header";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      await register({
        email,
        username,
        password,
      });
      setSuccess(true);
    } catch (err) {
      setErrors(parseApiErrors(err));
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
