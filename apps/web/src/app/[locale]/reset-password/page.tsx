"use client";

import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/actions/button";
import { resetPassword } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const t = useTranslations("ResetPassword");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (newPassword !== confirmPassword) {
      setErrors([t("passwordsNotMatch")]);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  }

  let content;
  if (!token) {
    content = (
      <AuthPageShell
        title={t("invalidLinkTitle")}
        subtitle={t("invalidLinkDesc")}
        footerText={t("requestNewDesc")}
        footerLinkHref="/login"
        footerLinkText={t("backToSignIn")}
      >
        <p className="text-sm text-ink-secondary text-center">{t("requestNewDesc")}</p>
      </AuthPageShell>
    );
  } else if (success) {
    content = (
      <AuthPageShell
        title={t("successTitle")}
        subtitle={t("successDesc")}
        footerText={t("readyToGo")}
        footerLinkHref="/login"
        footerLinkText={t("goToSignIn")}
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-ink-secondary">{t("signInWithNewPassword")}</p>
          <Button onClick={() => router.push("/login")}>{t("goToSignIn")}</Button>
        </div>
      </AuthPageShell>
    );
  } else {
    content = (
      <AuthPageShell
        title={t("setTitle")}
        subtitle={t("setSubtitle")}
        footerText={t("remembered")}
        footerLinkHref="/login"
        footerLinkText={t("backToSignIn")}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="new-password"
            label={t("newPassword")}
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <FormField
            id="confirm-password"
            label={t("confirmPassword")}
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <FormErrors errors={errors} />
          <Button type="submit" loading={loading} className="mt-1">
            {loading ? t("updating") : t("updatePassword")}
          </Button>
        </form>
      </AuthPageShell>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-y-auto scrollbar bg-canvas">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">{content}</main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
