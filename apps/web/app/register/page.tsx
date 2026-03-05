"use client";

import { devVerifyUser, register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/primitives/button";
import { Card } from "@/components/ui/primitives/card";
import Link from "next/link";
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
      setErrors(err instanceof ApiError ? err.messages : ["Unable to connect to the server. Please try again."]);
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
    <div className="flex items-center justify-center flex-1 p-6">
      <div className="w-full max-w-100">
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-ink">Create an account</h1>
          <p className="text-sm text-ink-secondary mt-1.5">Start using Nucleus today</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-semibold text-ink-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-elevated border border-stroke rounded-lg px-3 py-2.5 text-sm text-ink outline-none w-full transition-colors duration-150 focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-[13px] font-semibold text-ink-secondary">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="nickname"
                required
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                className="bg-elevated border border-stroke rounded-lg px-3 py-2.5 text-sm text-ink outline-none w-full transition-colors duration-150 focus:border-accent"
              />
              <span className="text-xs text-ink-muted">Letters, numbers, underscores and hyphens only</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-semibold text-ink-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-elevated border border-stroke rounded-lg px-3 py-2.5 text-sm text-ink outline-none w-full transition-colors duration-150 focus:border-accent"
              />
              <span className="text-xs text-ink-muted">
                Min 8 chars · uppercase · lowercase · number · special character
              </span>
            </div>

            {errors.length > 0 && (
              <div className="bg-error-bg border border-error rounded-lg px-3 py-2.5 text-[13px] text-error flex flex-col gap-1">
                {errors.map((msg, i) => (
                  <span key={i}>{msg}</span>
                ))}
              </div>
            )}

            <Button type="submit" loading={loading} className="mt-1">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-5 text-[13.5px] text-ink-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
