"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/button";
import { resetPassword } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (newPassword !== confirmPassword) {
      setErrors(["Passwords do not match."]);
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

  if (!token) {
    return (
      <AuthPageShell
        title="Invalid link"
        subtitle="This password reset link is missing or invalid."
        footerText="Go back to"
        footerLinkHref="/login"
        footerLinkText="Sign in"
      >
        <p className="text-sm text-ink-secondary text-center">Please request a new reset link from the login page.</p>
      </AuthPageShell>
    );
  }

  if (success) {
    return (
      <AuthPageShell
        title="Password updated"
        subtitle="Your password has been changed successfully."
        footerText="Ready to go?"
        footerLinkHref="/login"
        footerLinkText="Sign in"
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-ink-secondary">You can now sign in with your new password.</p>
          <Button onClick={() => router.push("/login")}>Go to sign in</Button>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Set new password"
      subtitle="Enter and confirm your new password"
      footerText="Remembered it?"
      footerLinkHref="/login"
      footerLinkText="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
        />
        <FormField
          id="confirm-password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
        <FormErrors errors={errors} />
        <Button type="submit" loading={loading} className="mt-1">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
