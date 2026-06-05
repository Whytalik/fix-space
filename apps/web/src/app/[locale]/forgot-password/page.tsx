"use client";

import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/actions/button";
import { forgotPassword } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header/landing/header";
import { Footer } from "@/components/layout/footer";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
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
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header hideNav />
      <main className="flex-1 flex items-center justify-center p-6">
        <AuthPageShell
          title={t("forgotPasswordTitle")}
          subtitle={t("forgotPasswordSubtitle")}
          footerText={t("remembered")}
          footerLinkHref="/login"
          footerLinkText={t("backToSignIn")}
        >
          {forgotSent ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm text-ink-secondary leading-relaxed">
                {t("resetEmailDesc")} <span className="text-ink font-medium">{forgotEmail}</span> {t("resetEmailDesc2")}
              </p>
              <Button variant="secondary" onClick={() => router.push("/login")}>
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
      </main>
      <Footer />
    </div>
  );
}
