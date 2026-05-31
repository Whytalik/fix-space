"use client";

import { Logo } from "@/components/ui/brand/logo";
import { useAppContext } from "@/context/app-context";

export function Footer() {
  const { user } = useAppContext();

  if (user) return null;

  return (
    <footer className="px-6 py-8 border-t border-stroke bg-canvas">
      <div className="flex items-center justify-between gap-4 mx-auto max-w-180">
        <Logo size={20} />

        <span className="text-[13px] text-ink-secondary">Diploma project · {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
