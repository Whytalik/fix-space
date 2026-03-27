"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { FormErrors } from "@/components/ui/form/form-errors";
import { FormField } from "@/components/ui/form/form-field";
import { Button } from "@/components/ui/primitives/button";
import { login } from "@/lib/api/auth";
import { parseApiErrors } from "@/lib/api/client";
import { storage } from "@/lib/storage";
import { useState } from "react";

type LoginFormProps = {
  onForgotClick: () => void;
};

export function LoginForm({ onForgotClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in to your FIX Space account"
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
            onClick={onForgotClick}
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
