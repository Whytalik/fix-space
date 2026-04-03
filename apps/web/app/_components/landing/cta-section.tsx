"use client";

import { LogoIcon } from "@/components/ui/brand/logo-icon";
import { Button } from "@/components/ui/primitives/button";
import { useRouter } from "next/navigation";

export function CtaSection() {
  const router = useRouter();

  return (
    <section className="py-24 px-6">
      <div className="bg-surface border border-stroke rounded-2xl px-10 py-14 max-w-155 mx-auto flex flex-col items-center gap-5 text-center">
        <LogoIcon size={40} />

        <div>
          <h2 className="text-[clamp(26px,4vw,38px)] font-bold tracking-[-0.04em] text-ink">
            Stop managing your data. Start understanding it.
          </h2>
          <p className="mt-3 text-sm text-ink-secondary max-w-sm mx-auto">
            Register and get a fully configured workspace — journal, routines, strategies, and accounts — ready the
            moment you sign up. Free to start.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
          <Button variant="primary" onClick={() => router.push("/register")}>
            Create free account
          </Button>
          <Button variant="secondary" onClick={() => router.push("/login")}>
            Sign in
          </Button>
        </div>
      </div>
    </section>
  );
}
