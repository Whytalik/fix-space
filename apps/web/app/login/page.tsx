"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/button";
import { forgotPassword, login } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { storage } from "@/lib/storage";
import { useState } from "react";

type View = "login" | "forgot";

export default function LoginPage() {
  const [view, setView] = useState<View>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotErrors, setForgotErrors] = useState<string[]>([]);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      const data = await login({ email, password });
      storage.setToken(data.accessToken);
      window.location.href = "/";
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  }

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

  function handleBackToLogin() {
    setView("login");
    setForgotEmail("");
    setForgotErrors([]);
    setForgotSent(false);
  }

  if (view === "forgot") {
    return (
      <AuthPageShell
        title="Forgot password"
        subtitle="Enter your email and we'll send you a reset link"
        footerText="Remembered it?"
        footerLinkHref="#"
        footerLinkText="Back to sign in"
        onFooterLinkClick={handleBackToLogin}
      >
        {forgotSent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-ink-secondary leading-relaxed">
              If <span className="text-ink font-medium">{forgotEmail}</span> is registered, you&apos;ll receive a
              password reset link shortly.
            </p>
            <Button variant="secondary" onClick={handleBackToLogin}>
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

  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in to your Nucleus account"
      footerText="Don't have an account?"
      footerLinkHref="/register"
      footerLinkText="Sign up"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <div className="flex flex-col gap-1.5">
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setView("forgot")}
            className="self-end text-xs text-ink-secondary hover:text-accent transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <FormErrors errors={errors} />
        <Button type="submit" loading={loading} className="mt-1">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthPageShell>
  );
}
