"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/button";
import { devVerifyUser, register } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devVerifying, setDevVerifying] = useState(false);

  const isDev = process.env.NODE_ENV === "development";

  async function handleDevVerify() {
    setDevVerifying(true);
    try {
      await devVerifyUser(email);
      router.push("/login");
    } finally {
      setDevVerifying(false);
    }
  }

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

  if (success) {
    return (
      <div className="flex items-center justify-center flex-1 p-6">
        <div className="flex flex-col items-center w-full gap-4 text-center max-w-100">
          <div className="flex items-center justify-center text-2xl border rounded-full w-14 h-14 bg-success-bg border-success">
            ✓
          </div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-ink">Check your email</h2>
          <p className="text-sm text-ink-secondary leading-relaxed max-w-[320px]">
            We sent a verification link to <strong className="text-ink">{email}</strong>. Click it to activate your
            account.
          </p>
          {isDev && (
            <Button onClick={handleDevVerify} loading={devVerifying} className="mt-2">
              {devVerifying ? "Verifying…" : "Verify instantly (dev)"}
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push("/login")}>
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthPageShell
      title="Create an account"
      subtitle="Start using Nucleus today"
      footerText="Already have an account?"
      footerLinkHref="/login"
      footerLinkText="Sign in"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="new-email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <FormField
          id="username"
          label="Username"
          type="text"
          autoComplete="nickname"
          required
          minLength={3}
          maxLength={50}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_username"
          hint="Letters, numbers, underscores and hyphens only"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          hint="Min 8 chars · uppercase · lowercase · number · special character"
        />
        <FormErrors errors={errors} />
        <Button type="submit" loading={loading} className="mt-1">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
