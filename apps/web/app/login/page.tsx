"use client";

import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Button, Card } from "@nucleus/ui";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const data = await login({
        email,
        password,
      });
      localStorage.setItem("access_token", data.accessToken);
      window.location.href = "/";
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ["Unable to connect to the server. Please try again."]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center flex-1 p-6">
      <div className="w-full max-w-100">
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-ink">Welcome back</h1>
          <p className="text-sm text-ink-secondary mt-1.5">Sign in to your Nucleus account</p>
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
              <label htmlFor="password" className="text-[13px] font-semibold text-ink-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-elevated border border-stroke rounded-lg px-3 py-2.5 text-sm text-ink outline-none w-full transition-colors duration-150 focus:border-accent"
              />
            </div>

            {errors.length > 0 && (
              <div className="bg-error-bg border border-error rounded-lg px-3 py-2.5 text-[13px] text-error">
                <ul className="flex flex-col gap-1 list-disc pl-4">
                  {errors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button type="submit" loading={loading} className="mt-1">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-5 text-[13.5px] text-ink-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-accent">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
